import shallowEqual from 'shallowequal';
import { Model } from '@graphistry/falcor-model-rxjs';
import { PostMessageDataSource } from '@graphistry/falcor-socket-datasource';
import { $ref, $atom, $value } from '@graphistry/falcor-json-graph';
import {
    ajax,
    catchError,
    concatMap,
    delay,
    filter,
    forkJoin,
    fromEvent,
    isEmpty,
    //last,
    map,
    mergeMap,
    Observable,
    of,
    pipe,
    ReplaySubject,
    scan,
    share,
    shareReplay,
    startWith,
    //Subject,
    switchMap,
    take,
    takeLast,
    tap,
    timer
} from './rxjs';  // abstract to simplify tolerating constant rxjs namespace manglings


const chainList = {};

// //////////////////////////////////////////////////////////////////////////////

    /**
     * @function makeCaller
     * @private
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}s
     * @param {string} modelName - 'view' or 'workbook'
     * @param {any} args - anything to pass as falcor .call(...args)
     * @return {@link GraphistryState} {@link Observable} 
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(
     *          makeCaller('view', 'tick', []),
     *          delay(2000),
     *          makeCaller('view', 'tick', []))
     *    .subscribe();
     **/
    export function makeCaller(modelName, ...args) {
        return switchMap(g => {
            console.debug('makeCaller switchMap', {g});
            //Wrap in Observable to insulate from PostMessageDataSource's rxjs version of Observable
            return (new Observable((subscriber) => {
                console.debug('caller hit', modelName, args, {g});
                let runs = 0;
                const sub = g.models[modelName]
                    .call(...args)
                    .subscribe(
                        (x) => { 
                            runs++;
                            console.debug('caller tick', x, {runs});
                            subscriber.next(x);
                        },
                        (e) => {
                            runs++;
                            console.error('caller error', e, {runs});
                            subscriber.error(e);
                        },
                        () => { 
                            console.debug('caller complete', modelName, args, {runs});
                            subscriber.complete();
                        });
                return () => {
                    console.debug('caller unsub skip', modelName, args, {runs});
                    sub.unsubscribe();
                };
            }))            
            .pipe(
                tap(v => console.debug('caller got', modelName, args, v, {g})),
                map(v => g.updateStateWithResult(v)));
        });
    }

    /**
     * @function makeCallerJSON
     * @private
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}s. Adds json desrialization to {@link makeCaller}.
     * @param {string} modelName - 'view' or 'workbook'
     * @param {any} args - anything to pass as falcor .call(...args)
     * @return {@link GraphistryState} {@link Observable} 
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(
     *          makeCaller('view', 'tick', []),
     *          delay(2000),
     *          makeCaller('view', 'tick', []))
     *    .subscribe();
     **/
    export function makeCallerJSON(modelName, ...args) {
        return switchMap(g => 
            of(g)
                .pipe(
                    makeCaller(modelName, ...args),
                    map(({ json }) => json.toJSON())));
    }


    /**
     * 
     * @function makeGetter
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}
     * @param {string} modelName 
     * @param  {...any} args - anything to pass as falcor .get(...args)
     * @returns {@link GraphistryState} {@link Observable}
     */
    export function makeGetter(modelName, ...args) {
        return switchMap(g => {
            //Wrap in Observable to insulate from PostMessageDataSource's rxjs version of Observable
            return (new Observable((subscriber) => {
                console.debug('getter hit', modelName, args);
                const sub = g.models[modelName]
                    .get(...args)
                    .subscribe(
                        (x) => { subscriber.next(x); },
                        (e) => { subscriber.error(e); },
                        () => { 
                            console.debug('getter complete', modelName, args);
                            subscriber.complete();
                        });
                return () => {
                    console.debug('getter unsub', modelName, args);
                    sub.unsubscribe();
                };
            }))
            .pipe(
                tap(v => console.debug('getter got', modelName, args, v)),
                map(v => g.updateStateWithResult(v)));
        });
    }

    /**
     * @function makeGetterJSON
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}. Adds json desrialization to {@link makeGetter}.
     * @param {string} modelName 
     * @param  {...any} args 
     * @returns {@link GraphistryState} {@link Observable}
     */
    export function makeGetterJSON(modelName, ...args) {
        return switchMap(g => 
            of(g)
                .pipe(
                    makeGetter(modelName, ...args)));
    }


    /*
    *       /*
        const { workbook } = this;
        return new this(workbook.get('id')
            .map(({ json }) => json.toJSON())
            .toPromise());
            */

    /**
     * @function makeSetterWithModel
     * @private
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}s
     * @param {string} modelName - 'view' or 'workbook'
     * @param {string} value - {@link $value} path/value pair
     * @return {@link GraphistryState} {@link Observable} 
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(makeSetterWithModel('view', model => myValuesFromModel(model)))
     *    .subscribe();
     **/
    export function makeSetterWithModel(modelName, valuesFromModel) {
        return switchMap((g) => {
            const values = valuesFromModel(g.models[modelName]);
            const out = g.models[modelName].set(...values);
            //Wrap in Observable to insulate from PostMessageDataSource's rxjs version of Observable
            return (new Observable((subscriber) => {
                console.debug('starting makeSetterWithModel postMessage cmds', values);
                const sub = out.subscribe(
                    ((v) =>{ subscriber.next(v); }),
                    ((e) =>{ subscriber.error({msg: 'iframe setter fail', e}); }),
                    (() =>{ subscriber.complete(); }));
                return () => {
                    console.debug('finished makeSetterWithModel; unsubscribe postMessage', {sub, values});
                    sub.unsubscribe();
                };
            }))
                .pipe(
                    tap((v) => { console.debug('setter resp pre', v); }),
                    map(({ json }) => g.updateStateWithResult(json.toJSON())),
                    tap((v) => { console.debug('setter resp post', v); }))
        });
    }

    /**
     * @function makeSetter
     * @private
     * @description Serialization and coordination for formatting postMessage API calls, used with {@link GraphistryState} {@link Observable}s
     * @param {string} modelName - 'view' or 'workbook'
     * @param {string} value - {@link $value} path/value pair
     * @return {@link GraphistryState} {@link Observable} 
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(makeSetter('view', $value('viz.width', 500)))
     *    .subscribe();
     **/
    export function makeSetter(modelName, ...values) {
        return makeSetterWithModel(modelName, () => { return values; });
    }

// //////////////////////////////////////////////////////////////////////////////


    /*
    static _getIds(componentType, name, dataType, values = []) {
        const { view } = this;
        return new this(view
            .call(`componentsByType['${componentType}'].rows.filter`, [name, dataType, values], ['_index'])
            .takeLast(1)
            .map(({ json = {} }) => {
                const { componentsByType = {} } = json;
                const { [componentType]: componentsForType = {} } = componentsByType;
                const { rows = {} } = componentsForType;
                return Array
                    .from(rows.filter || [])
                    .filter(Boolean).map(({ _index }) => _index);
            })
            .toPromise()
        );
    }
}
*/

    /**
     * Add columns to the current graph visuzliation's dataset
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function(g) {
     *         window.g = g;
     *         const columns = [
     *             ['edge', 'highways', [66, 101, 280], 'number'],
     *             ['point', 'theme parks', ['six flags', 'disney world', 'great america'], 'string']
     *         ];
     *         console.log('adding columns', columns);
     *         return g.addColumns.apply(g, columns);
     *     })
     *     .subscribe();
     */
    /*
    Graphistry.addColumns = function (...columns) {
        const { view } = this;
        return new this(this
            .from(columns)
            .concatMap((column) => view.call('columns.add', column))
            .map(({ json: { columns }}) => columns).filter(Boolean)
            .map((columns) => columns[columns.length - 1].toJSON())
            .toArray()
            .toPromise()
        );
    }
    */


    /**
     * @function encodeColor
     * @description Change colors based on an attribute. Pass null for attribute, mapping to clear.
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @param {Attribute} [attribute] - name of data column, e.g., 'degree'
     * @param {Variant} [variation] - If there are more bins than colors, use 'categorical' to repeat colors and 'continuous' to interpolate
     * @param {any} [colorsOrMapping] - array of color name or hex codes, or object mapping
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeColor('point', 'degree', 'categorical', ['black', 'white']))
     *     .subscribe();
     */
    export function encodeColor(graphType, attribute, variation, colorsOrMapping) {

        const colorDict = Array.isArray(colorsOrMapping) ? {colors: colorsOrMapping} : {mapping: colorsOrMapping};

        const value = $value(`encodings.${graphType}.color`,
        {   reset: attribute === undefined, variation, name: 'user_' + Math.random(),
            encodingType: 'color', graphType, attribute, ...colorDict });

        return makeSetter('view', value);
    }
    chainList.encodeColor = encodeColor;

    /**
     * @function resetColor
     * @description Reset color encoding
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(resetColor('point'))
     *    .subscribe();
     */
    export function resetColor(graphType) {
        return encodeColor(graphType);
    }
    chainList.resetColor = resetColor;

    /**
     * @function encodePointColor
     * @description Single-argument version of {@link encodeColor} used for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, 'categorical' or 'continuous', [ str ] or mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointColor())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointColor('prebaked_colors_col'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointColor(['degree', 'categorical', ['black', 'white']]))
     *     .subscribe();
    **/
    export function encodePointColor(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            if (opts instanceof Array) {
                for (let v of opts) {
                    args.push(v);
                }
            } else if (typeof(opts) === 'string') {
                args.push(opts);
            }
        }
        return encodeColor.apply(this, args);
    }
    chainList.encodePointColor = encodePointColor;

    /**
     * @function resetPointColor
     * @description Reset the point color encoding
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(resetPointColor())
     *    .subscribe();
     */
    export function resetPointColor() {
        return encodePointColor(undefined);
    }
    chainList.resetPointColor = resetPointColor;

    /**
     * @function encodeEdgeColor
     * @description Single-argument version of {@link encodeColor} used for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, 'categorical' or 'continuous', [ str ] or mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeColor())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeColor('prebaked_colors_col'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeColor(['degree', 'categorical', ['black', 'white']]))
     *     .subscribe();
    **/
    export function encodeEdgeColor (opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            if (opts instanceof Array) {
                for (let v of opts) {
                    args.push(v);
                }
            } else if (typeof(opts) === 'string') {
                args.push(opts);
            }
        }
        return encodeColor.apply(this, args);
    }
    chainList.encodeEdgeColor = encodeEdgeColor;

    /**
     * @function resetEdgeColor
     * @description Reset the edge color encoding
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *   .pipe(resetEdgeColor())
     *   .subscribe();
    */
    export function resetEdgeColor() {
        return encodeEdgeColor(undefined);
    }
    chainList.resetEdgeColor = resetEdgeColor; 


    /**
     * @function encodeAxis
     * @description Add an axis to the graph
     * @param {Object}
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     */
     export function encodeAxis(axis) {
        const value = $value(`encodings.point.axis`,
        {   reset: axis === undefined, name: 'user_' + Math.random(),
            encodingType: 'axis', graphType: 'point', attribute: 'degree', variation: 'categorical',
            rows: axis });

        return makeSetter('view', value);
    }
    chainList.encodeAxis = encodeAxis;



    /**
     * @function encodeIcons
     * @description Change icons based on an attribute. Pass undefined for attribute, mapping to clear.
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @param {Attribute} [attribute] - name of data column, e.g., 'icon'
     * @param {Mapping} [object] - optional value mapping, e.g., {categorical: {fixed: {ip: 'laptop', alert: 'alaram'}, other: 'question'}}
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeIcons('point', 'icon', 'some_attr'))
     *     .subscribe();
     **/
    export function encodeIcons(graphType, attribute, mapping) {
        const value = $value(`encodings.${graphType}.icon`,
        {   reset: attribute === undefined, name: 'user_' + Math.random(),
            encodingType: 'icon', graphType, attribute, mapping });
        return makeSetter('view', value);
    }
    chainList.encodeIcons = encodeIcons;

    /**
     * @function resetIcons
     * @description Reset the icon encoding
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *  .pipe(resetIcons())
     *  .subscribe();
     */
    export function resetIcons(graphType) {
        return encodeIcons(graphType);
    }
    chainList.resetIcons = resetIcons;

    /**
     * @function encodePointIcons
     * @description Single-argument point change icons based on an attribute for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointIcons())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointIcons('some_attr'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointIcons(['some_attr', some_mapping]))
     *     .subscribe();
    **/
    export function encodePointIcons(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            if (opts instanceof Array) {
                for (let v of opts) {
                    args.push(v);
                }
            } else if (typeof(opts) === 'string') {
                args.push(opts);
            }
        }
        return encodeIcons.apply(this, args);
    }
    chainList.encodePointIcons = encodePointIcons;

    /**
     * @function resetPointIcons
     * @description Reset the point icon encoding
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *  .pipe(resetPointIcons())
     *  .subscribe();
     */
    export function resetPointIcons() {
        return encodeIcons('point');
    }

    /**
     * @function encodeEdgeIcons
     * @description Single-argument edge change icons based on an attribute for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeIcons())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeIcons('some_attr'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeEdgeIcons(['some_attr', some_mapping]))
     *     .subscribe();
    **/
    export function encodeEdgeIcons(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            if (opts instanceof Array) {
                for (let v of opts) {
                    args.push(v);
                }
            } else if (typeof(opts) === 'string') {
                args.push(opts);
            }
        }
        return encodeIcons.apply(this, args);
    }
    chainList.encodeEdgeIcons = encodeEdgeIcons;

    /**
     * @function resetEdgeIcons
     * @description Reset the edge icon encoding
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     * .pipe(resetEdgeIcons())
     * .subscribe();
     */
    export function resetEdgeIcons() {
        return encodeIcons('edge');
    }
    chainList.resetEdgeIcons = resetEdgeIcons;


    /**
     * @function encodeSize
     * @description Change size based on an attribute. Pass null for attribute, mapping to clear.
     * @param {GraphType} [graphType] - 'point'
     * @param {Attribute} [attribute] - name of data column, e.g., 'degree'
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeSize('point', 'community_infomap'))
     *     .subscribe();
     */
     export function encodeSize(graphType, attribute, mapping) {
        const value = $value(`encodings.${graphType}.size`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'size', graphType, attribute, ...(mapping ? {mapping} : {}) });
        return makeSetter('view', value);
    }
    chainList.encodeSize = encodeSize;

    /**
     * @function resetSize
     * @description Reset the size encoding
     * @param {GraphType} [graphType] - 'point'
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *   .pipe(resetSize())
     *   .subscribe();
     */
    export function resetSize(graphType) {
        return encodeSize(graphType);
    }
    chainList.resetSize = resetSize;

    /**
     * @function encodePointSize
     * @description Single-argument point change size based on an attribute for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointSize())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointSize('some_attr'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodePointSize(['some_attr', some_mapping]))
     *     .subscribe();
    **/
    export function encodePointSize(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeSize.apply(this, args);
    }
    chainList.encodePointSize = encodePointSize;

    /**
     * @function resetPointSize
     * @description Reset the point size encoding
     * @returns {GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     * .pipe(resetPointSize())
     * .subscribe();
     */
    export function resetPointSize() {
        return encodeSize('point');
    }
    chainList.resetPointSize = resetPointSize;


    /**
     * @function togglePanel
     * @description Toggle a top menu panel on/off. If panel is an array, interpret as [panel, turnOn]
     * @param {string} [panel] - Name of panel: filters, exclusions, scene, labels, layout
     * @param {boolean} [turnOn] - Whether to make panel visible, or turn all off
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(togglePanel('filters', true));
     *     .subscribe();
     */
    export function togglePanel(panel, turnOn) {
        if (Array.isArray(panel)) {
            turnOn = panel.length > 1 ? panel[1] : undefined;
            panel = panel[0];
        }
        if (turnOn) {
            return makeSetterWithModel('view', (view) => {
                const values = [
                    $value(`filters.controls[0].selected`, panel === 'filters'),
                    $value(`scene.controls[1].selected`, panel === 'scene'),
                    $value(`labels.controls[0].selected`, panel === 'labels'),
                    $value(`layout.controls[0].selected`, panel === 'layout'),
                    $value(`exclusions.controls[0].selected`, panel === 'exclusions'),
                    $value(`panels.left`,
                        panel === 'filters' ? $ref(view._path.concat(`filters`))
                        : panel === 'scene' ? $ref(view._path.concat(`scene`))
                        : panel === 'labels' ? $ref(view._path.concat(`labels`))
                        : panel === 'layout' ? $ref(view._path.concat(`layout`))
                        : $ref(view._path.concat(`exclusions`)))
                ];
                return values;
            });
        } else {
            const values = [
                $value(`panels.left`, undefined),
                $value(`filters.controls[0].selected`, false),
                $value(`scene.controls[1].selected`, false),
                $value(`labels.controls[0].selected`, false),
                $value(`layout.controls[0].selected`, false),
                $value(`exclusions.controls[0].selected`, false)
            ];
            return makeSetter('view', ...values);
        }
    }
    chainList.togglePanel = togglePanel;

    /**
     * @function encodeDefaultIcons
     * @description Change default (user-unset) icons based on an attribute. Pass undefined for attribute, mapping to clear.
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @param {Attribute} [attribute] - name of data column, e.g., 'icon'
     * @param {Mapping} [object] - optional value mapping, e.g., {categorical: {fixed: {ip: 'laptop', alert: 'alaram'}, other: 'question'}}
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultIcons('point', 'icon', 'some_attr'))
     *     .subscribe();
     **/
    export function encodeDefaultIcons(graphType, attribute, mapping) {
        const value = $value(`encodings.defaults.${graphType}.icon`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'icon', graphType, attribute, mapping });
        return makeSetter('view', value);
    }
    chainList.encodeDefaultIcons = encodeDefaultIcons;

    /**
     * @function encodeDefaultPointIcons
     * @description Single-argument point default icons (user-unset) based on an attribute for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultPointIcons())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultPointIcons('some_attr'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultPointIcons(['some_attr', some_mapping]))
     *     .subscribe();
    **/
    export function encodeDefaultPointIcons(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultIcons.apply(this, args);
    }
    chainList.encodeDefaultPointIcons = encodeDefaultPointIcons;

    /**
     * @function encodeDefaultEdgeIcons
     * @description Single-argument edge default icons (user-unset) based on an attribute for React props
     * @param {Array} array: undefined to reset; str to use directly; [str attr, mapping]
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultEdgeIcons())
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultEdgeIcons('some_attr'))
     *     .subscribe();
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(encodeDefaultEdgeIcons(['some_attr', some_mapping]))
     *     .subscribe();
    **/
    export function encodeDefaultEdgeIcons(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultIcons.apply(this, args);
    }
    chainList.encodeDefaultEdgeIcons = encodeDefaultEdgeIcons;

    export function encodeDefaultSize(graphType, attribute, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.defaults.${graphType}.size`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'size', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    chainList.encodeDefaultSize = encodeDefaultSize;

    export function encodeDefaultPointSize(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultSize.apply(this, args);
    }
    chainList.encodeDefaultPointSize = encodeDefaultPointSize;

    export function encodeDefaultEdgeSize(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultSize.apply(this, args);
    }
    chainList.encodeDefaultEdgeSize = encodeDefaultEdgeSize;

    export function encodeDefaultColor(graphType, attribute, variation, mapping) {
        const value = $value(`encodings.defaults.${graphType}.color`,
                {   reset: attribute === undefined, variation, name: 'user_' + Math.random(),
                    encodingType: 'color', graphType, attribute, mapping });
        return makeSetter('view', value);
    }
    chainList.encodeDefaultColor = encodeDefaultColor;

    export function encodeDefaultPointColor(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultColor.apply(this, args);
    }
    chainList.encodeDefaultPointColor = encodeDefaultPointColor;

    export function encodeDefaultEdgeColor(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return encodeDefaultColor.apply(this, args);
    }
    chainList.encodeDefaultEdgeColor = encodeDefaultEdgeColor;

    /**
     * @function toggleInspector
     * @description Toggle inspector panel
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(toggleInspector(true))
     *     .subscribe();
     */
     export function toggleInspector(turnOn) {
        if (!turnOn) {
            const values = [
                $value(`panels.bottom`, undefined),
                $value(`inspector.controls[0].selected`, false)
            ];
            return makeSetter('view', ...values);
        } else {
            return makeSetterWithModel('view', (view => {
                const values = [
                    $value(`inspector.controls[0].selected`, true),
                    $value(`panels.bottom`, $ref(view._path.concat(`inspector`)))
                ];
                return values;
            }));
        }
    }
    chainList.toggleInspector = toggleInspector;

    /**
     * @function toggleTimebars
     * @description Toggle timebars panel
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(toggleTimebars(true));
     *     .subscribe();
     */
     export function toggleTimebars(turnOn) {
        if (!turnOn) {
            const values = [
                $value(`panels.bottom`, undefined),
                $value(`timebars.controls[0].selected`, false)
            ];
            return makeSetter('view', ...values);
        } else {
            return makeSetterWithModel('view', (view => {
                const values = [
                    $value(`timebars.controls[0].selected`, true),
                    $value(`panels.bottom`, $ref(view._path.concat(`timebars`)))
                ];
                return values;
            }));
        }
    }
    chainList.toggleTimebars = toggleTimebars;

    /**
     * @function toggleHistograms
     * @description Toggle histogram panel
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .pipe(toggleHistograms(true))
     *     .subscribe();
     */
     export function toggleHistograms(turnOn) {
        return makeSetterWithModel('view', (view => {
            if (!turnOn) {
                return [
                    $value(`panels.right`, undefined),
                    $value(`histograms.controls[0].selected`, false)
                ];
            } else {
                return [
                    $value(`histograms.controls[0].selected`, true),
                    $value(`panels.right`, $ref(view._path.concat(`histograms`)))
                ];
            }
        }));
    }
    chainList.toggleHistograms = toggleHistograms;

    /**
     * @function Graphistry.tickClustering
     * @description Run a number of steps of Graphistry's clustering algorithm
     * @param {number} ticks - The number of ticks to run
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(tickClustering())
     *     .subscribe();
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(tickClustering(10))
     *     .subscribe();
     */
     export function tickClustering(/*ticks = 1*/) {

        throw new Error('Not implemented');
        /*

        console.debug('tickClustering', {ticks});

        if (typeof ticks !== 'number') {
            return map(g => g);
        }
        return switchMap(g => {
            return (
                timer(0, 40)
                .pipe(
                    tap((v) => console.debug('tick', v, g)),
                    take(Math.abs(ticks) || 1),
                    tap((v) => console.debug('tick b', v, g)),
                    map(() => g),
                    makeCaller('view', 'tick', [{}]),
                    isEmpty(),
                    tap((v) => console.debug('tick result', v, g)),
                    takeLast(1)
                ));
        });
        */
    }
    chainList.tickClustering = tickClustering;

    /**
     * Center the view of the graph
     * @function autocenter
     * @todo Implement this function
     * @static
     * @param {number} percentile - Controls sensitivity to outliers
     * @param {function} [cb] - Callback function of type callback(error, result)
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(autocenter(.90))
     *     .subscribe();
     */
    export function autocenter(percentile) {
        return makeCallerJSON('view', 'autocenter', [percentile]);
    }
    chainList.autocenter = autocenter;

    /**
     * Read the workbook ID
     * @function getCurrentWorkbook
     * @param {function} [cb] - Callback function of type callback(error, result)
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(getCurrentWorkbook())
     *     .subscribe(function (workbook) {
     *         alert('id: ' + workbook.id)
     *     });
     */
    export function getCurrentWorkbook () {
        return makeGetterJSON('workbook', 'id');
    }
    chainList.getCurrentWorkbook = getCurrentWorkbook;

    /**
     * Save the current workbook. A saved workbook will persist the analytics state
     * of the visualization, including active filters and exclusions
     * @function saveWorkbook
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(saveWorkbook())
     *     .subscribe();
     */
    export function saveWorkbook() {
        return makeCallerJSON('workbook', 'save', []);
    }
    chainList.saveWorkbook = saveWorkbook;


    /**
     * Hide or Show Toolbar UI
     * @function toogleToolbar
     * @param {boolean} show - Set to true to show toolbar, and false to hide toolbar.
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     *
     * <button onclick="g.pipe(toggleToolbar(false)).subcribe()">Hide toolbar</button>
     * <button onclick="g.pipe(toggleToolbar(true)).subscribe()">Show toolbar</button>
     *
     */
    export function toggleToolbar(show) {
        return updateSetting('showToolbar', !!show);
    }
    chainList.toggleToolbar = toggleToolbar;

    /**
     * Add a filter to the visualization with the given expression
     * @function addFilter
     * @param {string} expr - An expression using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(
     *          addFilter('point:degree > 0'),
     *          addFilter('edge:value > 0'))
     *     .subscribe();
     */
    export function addFilter(expr) {
        return makeCaller('view', 'filters.add', [expr]);
    }
    chainList.addFilter = addFilter;

    /**
     * Add filters to the visualization with the given expression
     * @function addFilter
     * @param {array} expr - An array of expressions using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(addFilters(['point:degree > 0', 'edge:value > 0'])));
     *     .subscribe();
     */
    export function addFilters(expr) {

        if (typeof(expr) === 'string') {
            return addFilter(expr);
        }

        if (!Array.isArray(expr)) {
            throw new Error('Expected an array of filters');
        }

        return switchMap(g => {
            return forkJoin(expr.map(e => of(g).pipe(addFilter(e))))
                .pipe(map((results) => g.updateStateWithResult(results)));
        });
    }
    chainList.addFilters = addFilters;

    /**
     * Add an exclusion to the visualization with the given expression
     * @function addExclusion
     * @param {string} expr - An expression using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(addExclusion('point:degree > 0'))
     *     .subscribe();
     */
    export function addExclusion(expr) {
        return makeCaller('view', 'exclusions.add', [expr]);
    }
    chainList.addExclusion = addExclusion;

    /**
     * Add an exclusion to the visualization with the given expression
     * @function addExclusions
     * @param {array} expr - Expressions using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(addExclusions(['point:degree > 0'], ['edge:value > 0']))
     *     .subscribe();
     */
    export function addExclusions(expr) {

        if (typeof(expr) === 'string') {
            return addExclusion(expr);
        }

        if (!Array.isArray(expr)) {
            throw new Error('Expected an array of exclusions');
        }

        return switchMap(g => {
            return forkJoin(expr.map(e => of(g).pipe(addExclusion(e))))
                .pipe(map((results) => g.updateStateWithResult(results)));
        });
    }
    chainList.addExclusions = addExclusions;

    const G_API_SETTINGS = {

        //models/toolbar.js
        'showToolbar': ['view', 'toolbar.visible'],

        //models/scene/scene.js
        'pruneOrphans': ['view', 'pruneOrphans'],
        'showArrows':   ['view', 'scene.renderer.showArrows'],
        'background':   ['view', 'scene.renderer.background.color'],
        'edgeOpacity':  ['view', 'scene.renderer.edges.opacity'],
        'edgeSize':     ['view', 'scene.renderer.edges.scaling'],
        'edgeCurvature': ['view', 'scene.renderer.edges.curvature'],
        'pointOpacity': ['view', 'scene.renderer.points.opacity'],
        'pointSize':    ['view', 'scene.renderer.points.scaling'],

        //models/camera.js
        'zoom':   ['view', 'camera.zoom'],
        'center': ['view', 'camera.center["x", "y", "z"]'],

        //models/label.js
        'labelOpacity':          ['view', 'labels.opacity'],
        'labelEnabled':          ['view', 'labels.enabled'],
        'labelPropertiesEnabled': ['view', 'labels.propertiesEnabled'],
        'labelPOI':              ['view', 'labels.poiEnabled'],
        'labelLabelPOI':              ['view', 'labels.poiLabelEnabled'],
        'labelPOIMax':           ['view', 'labels.poiMax'],
        'labelHighlightEnabled': ['view', 'labels.highlightEnabled'],
        'labelColor':            ['view', 'labels.foreground.color'],
        'labelBackground':       ['view', 'labels.background.color'],

        //models/layout.js
        'precisionVsSpeed': ['view', 'layout.options.forceatlas2barnes[0].value'],
        'gravity':          ['view', 'layout.options.forceatlas2barnes[1].value'],
        'scalingRatio':     ['view', 'layout.options.forceatlas2barnes[2].value'],
        'edgeInfluence':    ['view', 'layout.options.forceatlas2barnes[3].value'],
        'strongGravity':    ['view', 'layout.options.forceatlas2barnes[4].value'],
        'dissuadeHubs':     ['view', 'layout.options.forceatlas2barnes[5].value'],
        'linLog':           ['view', 'layout.options.forceatlas2barnes[6].value'],
        'lockedX':          ['view', 'layout.options.forceatlas2barnes[7].value'],
        'lockedY':          ['view', 'layout.options.forceatlas2barnes[8].value'],
        'lockedR':          ['view', 'layout.options.forceatlas2barnes[9].value'],
    };

    /**
     * @description
     * Modify a settings value in the visualization
     *
     * | Available Settings | Value Type |
     * | ------------------ | ---------- |
     * | `showToolbar` | `boolean` |
     * | `pruneOrphans` | `boolean` |
     * | `showArrows` | `boolean` |
     * | `background` | color as hex or rgba `string` |
     * | `edgeOpacity` | `number` (0 to 1) |
     * | `edgeSize` | `number` (0.1 to 10) |
     * | `edgeCurvature` | `number` (0.1 to 1) |
     * | `pointOpacity` | `number` (0 to 1) |
     * | `pointSize` | `number` (0.1 to 10) |
     * | `zoom` | `uint` |
     * | `center` | `const 0` |
     * | `labelOpacity` | `boolean` |
     * | `labelEnabled` | `boolean` |
     * | `labelPOI` | `boolean` |
     * | `labelLabelPOI` | `boolean` |
     * | `labelHighlightEnabled` | `boolean` |
     * | `labelColor` | color as hex or rgba `string` |
     * | `labelBackground` | color as hex or rgba `string` |
     * | `precisionVsSpeed` | `int` (-5 to +5) |
     * | `gravity` | `number` (0 to 10) |
     * | `scalingRatio` | `number` (0 to 10) |
     * | `edgeInfluence` | `number` (0 to 10) |
     * | `strongGravity` | `boolean` |
     * | `dissuadeHubs` | `boolean` | 
     * | `linLog` | `boolean` |
     * | `lockedX` | `boolean` | 
     * | `lockedY` | `boolean` | 
     * | `lockedR` | `boolean` | 
     * @function updateSetting
     * @param {string} name - the name of the setting to change
     * @param {string} val - the value to set the setting to.
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * graphistryJS(document.getElementById('viz'))
     *     .pipe(updateSetting('background', 'red'))
     *     .subscribe();
     */
    export function updateSetting (name, val) {
        console.debug('updating setting called', {G_API_SETTINGS, name, val});
        if (G_API_SETTINGS[name] === undefined) {
            throw new Error(`Property "${name}" is not a valid setting, available are: ${Object.keys(G_API_SETTINGS).join(', ')}`);
        }
        const [modelType, path] = G_API_SETTINGS[name];

        const value = $value(path, $atom(val, { $timestamp: Date.now() }) );
        return makeSetter(modelType, value);
    }
    chainList.updateSetting = updateSetting;

    /**
     * Update the camera zoom level
     * @function updateZoom
     * @param {number} level - Controls how far to zoom in or out.
     * @return {@link GraphistryState} A {@link GraphistryState} {@link Observable} that emits the result of the operation
     * @example
     * graphistryJS(document.getElementById('viz'))
     *     .pipe(updateZoom(2), delay(2000), updateZoom(0.5))
     *     .subscribe();
     */
    export function updateZoom (level) {
        return updateSetting('zoom', level);
    }
    chainList.updateZoom = updateZoom;

    /**
     * Get or create an {@link Observable} stream of all label updates from the visualization.
     * <p>
     * The {@link Observable} returned by this method emits inner Observables, where each
     * inner {@link Observable} is tied to the lifetime of the label for which it was created.
     * </p><p>
     * For each label rendered in the visualization, the {@link Observable} returned by this
     * method will create and emit a new inner {@link Observable}. The inner {@link Observable} will
     * emit events when the label changes. For example, if the user clicks on the label,
     * or the label changes position because of a pan/zoom, the inner {@link Observable} will
     * emit an event.
     * </p><p>
     * The inner {@link Observable} for a label will complete if the label is removed from the screen.
     * </p><p>
     * @function labelUpdates
     * @param {object} [cache] - An optional cache object (empty object) to use for caching label updates across subscriptions.
     * @return {Observable<Observable<LabelEvent>>} An {@link Observable} of inner {Observables}, where each
     * inner {@link Observable} represents the lifetime of a label in the visualization.
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .pipe(
     *          labelUpdates(),
     *          tap(({ id, tag, pageX, pageY }) => {
     *                 // prints messages like
     *                 // > 'Label 13 added at (200, 340)'
     *                 // > 'Label 74 updated at (750, 100)'
     *                 console.log(`Label ${id} ${tag} at (${pageX}, ${pageY})`);
     *          }),
     *          takeLast(1),
     *          tap(function ({ id, pageX, pageY }) {
     *                 console.log(`Label ${id} removed at (${pageX}, ${pageY})`);
     *          });
     *     })
     *     .subscribe();
     * @example
     * var cache = {};
     * //first use
     * GraphistryJS(document.getElementById('viz'))
     *    .pipe(labelUpdates(cache))
     *    .subscribe();
     * //second time reuse the cache to avoid excess event queue slowdowns 
     * GraphistryJS(document.getElementById('viz'))
     *      .pipe(labelUpdates(cache))
     *     .subscribe()
     */

    export function labelUpdates(cache = {}) {

        //FIXME cache on specific iframe
        return cache.labelsStream || (cache.labelsStream = fromEvent(window, 'message')
            .pipe(
                map(o => o.data),
                filter(o => o && o.type === 'labels-update'),
                shareReplay({ bufferSize: 1, refCount: true }),
                scan((memo, { labels, simulating, semanticZoomLevel }) => {

                        labels = labels || [];
                        const updates = [], newSources = [];
                        const labelsById = Object.create(null);
                        const nextSources = Object.create(null);
                        const { sources, prevLabelsById } = memo;
                        let idx = -1, len = labels.length, label;
        
                        while (++idx < len) {
                            let source;
                            label = labels[idx];
                            const { id } = label;
        
                            if (id in sources) {
                                source = sources[id];
                                delete sources[id];
                                if (memo.simulating !== simulating ||
                                    memo.semanticZoomLevel !== semanticZoomLevel ||
                                    !shallowEqual(prevLabelsById[id], label)) {
                                    updates.push({ ...label, simulating, semanticZoomLevel, tag: 'updated' });
                                }
                            } else {
                                newSources.push(source = new ReplaySubject(1));
                                updates.push({ ...label, simulating, semanticZoomLevel, tag: 'added' });
                                source.key = id;
                            }
        
                            labelsById[id] = label;
                            nextSources[id] = source;
                        }
        
                        for (const id in sources) {
                            sources[id].complete();
                        }
        
                        idx = -1;
                        len = updates.length;
                        while (++idx < len) {
                            label = updates[idx];
                            nextSources[label.id].next(label);
                        }
        
                        return {
                            newSources,
                            simulating,
                            semanticZoomLevel,
                            sources: nextSources,
                            prevLabelsById: labelsById
                        };


                    },
                    {
                        newSources: [],
                        sources: Object.create(null),
                        prevLabelsById: Object.create(null),
                    }),
                mergeMap(({ newSources }) => newSources)));
    }
    //subscribable (g.labelUpdates())

    /**
     * Subscribe to label change and exit events
     * @function subscribeLabels
     * @param {Object} - An Object with `onChange` and `onExit` callbacks
     * @return {Subscription} A {@link Subscription} that can be used to stop reacting to label updates
     * @example
     * var sub = graphistryJS(document.getElementById('viz'))
     *    .pipe(subscribeLabels({
     *       onChange: (label) => {
     *         console.log(`Label ${label.id} changed at (${label.pageX}, ${label.pageY})`);
     *      },
     *     onExit: (label) => {
     *        console.log(`Label ${label.id} removed at (${label.pageX}, ${label.pageY})`);
     *    }
     * }));
     * setTimeout(() => { sub.unsubscribe(); }, 5000);
     */
    export function subscribeLabels({ onChange, onExit, cache = {} }) {
        //throw new Error('subscribeLabels not implemented', onChange, onExit);

        return labelUpdates(cache)
            .pipe(
                mergeMap((group) =>  {
                    return group
                        .pipe(
                            tap((event) => onChange && onChange(event)),
                            takeLast(1),
                            tap((event) => onExit && onExit(event)));
                        }))
            .subscribe();
    }


class GraphistryState {
    
    constructor(iFrame, models, result) {
        this._iFrame = iFrame;
        this._models = models;
        this.result = result;
    }

    clone() {
        return new GraphistryState(this.iFrame, this.models, this.result);
    }

    get iFrame() {
        return this._iFrame;
    }

    get models() {
        return this._models;
    }

    get workbook() {
        return this.models.workbook;
    }

    get view() {
        return this.models.view;
    }

    updateStateWithResult(result) {
        const clone = this.clone();
        clone.result = result;
        return clone;
    }

}

function wrapCallback(obs, pipeable, withCB = false) {
    return function (...args) {
        var val, hasVal = false;
        const cb = withCB 
            && args.length && (args[args.length - 1] instanceof Function)
            ? args[args.length - 1]
            : function () {};
        return (obs
            .pipe(pipeable(...args))
            .subscribe(
                x => { hasVal = true; val = x; },
                e => cb(e),
                () => { hasVal && cb(null, val) }
            ));
    };
}

function aliasLegacyToplevels(o) {
    o.do = function (f) {
        const out = this.pipe(tap(f));
        return aliasLegacyToplevels(out);
    };
    o.map = function (f) {
        const out = this.pipe(map(f));
        return aliasLegacyToplevels(out);
    };
    o.switchMap = function (f) {
        const out = this.pipe(switchMap(f));
        return aliasLegacyToplevels(out);
    };
    return o;
}


//Convenience functions that match the old API
//(Deprecate?)
function addCallbacks(obs, target) {

    if (!target) {
        target = obs;
    }

    //We used to extend Observable to make chaining extensions monadic...
    //... but RxJS is phasing that out, so we no longer, and just keep initial top-level

    //returns Subscriptions
    Object.keys(chainList).forEach(key => {
        target[key] = wrapCallback(obs, chainList[key]);
        target[key + 'CB'] = wrapCallback(obs, chainList[key], true);
    });

    /*
    const lift = function (obs, f) {
        return function (...args) {
            return obs.pipe(f(...args));
        };
    };
    */
    target.labelUpdates = labelUpdates;// lift(obs, labelUpdates);
    target.subscribeLabels = subscribeLabels;//lift(obs, subscribeLabels);
    return target;
}


/**
 * Function that wraps an IFrame as an {@link Observable} {@link GraphistryState} - other methods in this library can be piped with it
 * @func graphistryJS
 * @exports module:Graphistry
 * @param {Object} IFrame - An IFrame that hosts a Graphistry visualization.
 * @return {@link GraphistryState} - Observable that emits {@link GraphistryState} (must .subscribe() to start listening)
 * @example
 *
 * <iframe id="viz" src="https://hub.graphistry.com/graph/graph.html?dataset=Miserables" />
 * <script>
 * document.addEventListener("DOMContentLoaded", function () {
 *
 *     graphistryJS(document.getElementById('viz'))
 *        .pipe(
 *           tap((g) => {
 *             console.log('iframe ready; opening filters, pausing, then adding columns');
 *             document.getElementById('controls').style.opacity=1.0);
 *             window.g = g;
 *           }),
 *           openFilters,
 *           delay(5000),
 *           switchMap((g) => {
 *             console.log('filters opened & delayed; adding columns');
 *             const columns = [
 *                 ['edge', 'highways', [66, 101, 280], 'number'],
 *                 ['point', 'theme parks', ['six flags', 'disney world', 'great america'], 'string']
 *             ];
 *             return (
 *                  forkJoin(columns.map(([type, name, values, type]) => addColumn(type, name, values, type)))
 *                  .pipe(map(() => g)))
 *        })
 *        .subscribe(
 *            (g) => { console.log('event', g); },
 *            (err) => { console.log('error', err); },
 *           () => { console.log('all done'); }
*         });
 * </script>
 *
 */
export function graphistryJS(iFrame) {

    if (!iFrame) {
        throw new Error('No iframe provided to Graphistry');
    }

    console.debug('init graphistryJS', {iFrame, fromEvent, updateSetting, ajax});

    const flow = (
        fromEvent(iFrame, 'load')
        .pipe(
            tap((v) => { console.debug('Starting iframe protocol listen flow: Load trigger'), v }),
            startWith(iFrame),
            tap((v) => { console.debug('Starting iframe protocol listen flow: v', v) }),
            filter(target => target && target.contentWindow && target.contentWindow.postMessage),
            map(target => target.contentWindow),
            tap((target) => {
                console.info(`Graphistry API: connecting to client`, target);
                target.postMessage({type: 'ready', agent: 'graphistryjs'}, '*');
            }),
            switchMap(
                ((target) => 
                    fromEvent(window, 'message') //FIXME why not target? how to ensure proper frame?
                    .pipe(
                        filter(({ data, cache, ...rest }) => {
                            if (data && data.type === 'init') {
                                console.debug('received valid postMessage handshake', {data, cache, rest});
                                return true;
                            } else {
                                console.debug('received irrelevant postMessage handshake', {data, cache, rest});
                                return false;
                            }
                        }),
                        map(({ data: { cache }, cache: cache2 }) => ({ target, cache, cache2 }))))),
            switchMap(({ target, cache, cache2 }) => {

                console.debug('Graphistry API: init filter passed, handling', {target, cache, cache2});

                //Observable wrapper insulating from Model's rxjs version
                // ... assume just new/get/subscribe/unsubscribe
                const model = new Model({
                    cache: cache || cache2 || {},
                    recycleJSON: true,
                    //scheduler: Scheduler.async, //TODO use default?
                    allowFromWhenceYouCame: true
                });
                model._source = new PostMessageDataSource(window, target, model, '*');
                return (new Observable((subscriber) => {
                    const sub = model.get(`workbooks.open.views.current.id`)
                        .subscribe(
                            (result) => { subscriber.next(result); },
                            (error) => { subscriber.error('iframe model initialization error', error); },
                            () => {
                                console.debug('PostMessageDataSource: teardown');
                                subscriber.complete();
                            });
                    return () => { sub.unsubscribe(); };
                }))
                    .pipe(
                        map(({ json, ...rest }) => {
                            console.debug('got postMessage model hit', json, rest)
                            const workbook = model.deref(json.workbooks.open);
                            const view = model.deref(json.workbooks.open.views.current);
                            console.debug(`PostMessageDataSource: connected to client`, { workbook, view });
                            return { workbook, view };
                        }),
                        map(({ workbook, view }) => new GraphistryState(iFrame, {model, view, workbook})),
                        tap((result) => {
                            console.info(`Graphistry API: connected to client`, result)
                        }));
            }),
            tap((result) => {
                console.debug(`Graphistry API (pre-replay): connected to client`, result)
            })
    ));

    //https://rxjs.dev/deprecations/multicasting
    const resubscribable = 
        flow.pipe(
                shareReplay(1),
                tap((result) => { console.debug(`Graphistry API (replay): connected to client`, result) }),
        );

    const flowEnriched = resubscribable.pipe(map((g) => addCallbacks(resubscribable, g)));

    addCallbacks(flowEnriched);
    aliasLegacyToplevels(flowEnriched);

    return flowEnriched;
}


//https://github.com/evanw/esbuild/issues/1719
//export default graphistryJS;

export const GraphistryJS = graphistryJS;

/* legacy */
(function () { 
    try {
        window.GraphistryJS = graphistryJS;
    } catch (e) { }  // eslint-disable-line no-empty
}());

export {

    //rxjs: reexport for end-user convenience without explicit dependency / rxjs expertise
    ajax,
    catchError,
    concatMap,
    delay,
    filter,
    forkJoin,
    fromEvent,
    isEmpty,
    map,
    mergeMap,
    Observable,
    of,
    pipe,
    ReplaySubject,
    scan,
    share,
    shareReplay,
    startWith,
    switchMap,
    take,
    takeLast,
    tap,
    timer
    
    //g api
    //updateSetting, // exported upon definition
};

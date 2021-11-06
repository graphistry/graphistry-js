import shallowEqual from 'shallowequal';
import { Model } from '@graphistry/falcor-model-rxjs';
import { PostMessageDataSource } from '@graphistry/falcor-socket-datasource';
import { $ref, $atom, $value, $invalidate } from '@graphistry/falcor-json-graph';
import { $$observable, Subject, Scheduler, Observable, AsyncSubject, ReplaySubject } from './rxjs';


/**
 * @class Graphistry
 * @classdesc This object wraps a HTML IFrame of a Graphistry Visualization in order
 * to provide an API for interacting with the graph.
 * @extends Observable
 * @see {@link https://github.com/ReactiveX/rxjs/blob/master/doc/observable.md}
 */
class Graphistry extends Observable {

    /**
     * Create Graphistry {@link Observable} by extending observable's methods
     * @param {Object} source - The source observable.
     */
    constructor(source) {
        if (!source || typeof source === 'function' || typeof source !== 'object') {
            super(source);
        } else {
            super();
            if (typeof source[$$observable] === 'function') {
                this.source = source[$$observable]();
            } else {
                this.source = this.constructor.from(source);
            }
        }
    }

    /**
     * Creates a new {@link Observable} with this as the source, and the passed
     * operator as the new Observable's operator.
     * @method Graphistry~lift
     * @param {Operator} operator - the operator defining the operation to apply to the {@link Observable}
     * @return {@link Observable} a new {@link Observable} with the operator applied
     */
    lift(operator) {
        const observable = new Graphistry(this);
        observable.operator = operator;
        return observable;
    }

    /**
     * @private
     */
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

    /**
     * Add columns to the current graph visuzliation's dataset
     * @method Graphistry.addColumns
     * @params {...Arrays} columns - One of more columns to be appended to the dataset
     * @return {Graphistry<Array<Column>>} A {@link Graphistry} {@link Observable} that emits an Array of the new columns
     * @example
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
    static addColumns(...columns) {
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


    /**
     * Change colors based on an attribute. Pass null for attribute, mapping to clear.
     * @method Graphistry.encodeColor
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @param {Attribute} [attribute] - name of data column, e.g., 'degree'
     * @param {Variant} [variation] - If there are more bins than colors, use 'categorical' to repeat colors and 'continuous' to interpolate
     * @param {Array} [mapping] - array of color name or hex codes
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         return g.encodeColor('point', 'degree', 'categorical', ['black', 'white'])
     *     })
     *     .subscribe();
     */
    static encodeColor(graphType, attribute, variation, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.${graphType}.color`,
                {   reset: attribute === undefined, variation, name: 'user_' + Math.random(),
                    encodingType: 'color', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // str, str, array (attr, variation, mapping)
    static encodePointColor(opts) {
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
        return this.encodeColor.apply(this, args);
     }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // str, str, array (attr, variation, mapping)
    static encodeEdgeColor(opts) {
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
        return this.encodeColor.apply(this, args);
     }


    /**
     * Change axis
     * @method Graphistry.encodeAxis
     * @param {Array} array of strings
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         return g.encodeAxis({})
     *     })
     *     .subscribe();
     */
    static encodeAxis(axis) {
        const { view } = this;

        return new this(view.set(
            $value(`encodings.point.axis`,
                {   reset: axis === undefined, name: 'user_' + Math.random(),
                    encodingType: 'axis', graphType: 'point', attribute: 'degree', variation: 'categorical',
                    rows: axis }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }



    /**
     * Change icons based on an attribute. Pass undefined for attribute, mapping to clear.
     * @method Graphistry.encodeIcons
     * @param {GraphType} [graphType] - 'point' or 'edge'
     * @param {Attribute} [attribute] - name of data column, e.g., 'icon'
     * @param {Mapping} [object] - optional value mapping, e.g., {categorical: {fixed: {ip: 'laptop', alert: 'alaram'}, other: 'question'}}
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         return g.encodeIcons('point', 'icon')
     *     })
     *     .subscribe();
     */
    static encodeIcons(graphType, attribute, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.${graphType}.icon`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'icon', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // str, array (attr, mapping)
    static encodePointIcons(opts) {
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
        return this.encodeIcons.apply(this, args);
     }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // str, array (attr, mapping)
    static encodeEdgeIcons(opts) {
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
        return this.encodeIcons.apply(this, args);
     }

    /**
     * Change size based on an attribute. Pass null for attribute, mapping to clear.
     * @method Graphistry.encodeSize
     * @param {GraphType} [graphType] - 'point'
     * @param {Attribute} [attribute] - name of data column, e.g., 'degree'
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         return g.encodeSize('point', 'community_infomap')
     *     })
     *     .subscribe();
     */
    static encodeSize(graphType, attribute, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.${graphType}.size`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'size', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }

    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodePointSize(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeSize.apply(this, args);
     }


    /**
     * Toggle a leftside panel
     * @method Graphistry.togglePanel
     * @param {string} [panel] - Name of panel: filters, exclusions, scene, labels, layout
     * @param {boolean} [turnOn] - Whether to make panel visible, or turn all off
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('opening filters');
     *         return g.togglePanel('filters', true);
     *     })
     *     .subscribe();
     */
    static togglePanel(panel, turnOn) {
        const { view } = this;
        if (turnOn) {
            return new this(view.set(
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
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        } else {
            return new this(view.set(
                $value(`panels.left`, undefined),
                $value(`filters.controls[0].selected`, false),
                $value(`scene.controls[1].selected`, false),
                $value(`labels.controls[0].selected`, false),
                $value(`layout.controls[0].selected`, false),
                $value(`exclusions.controls[0].selected`, false)
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        }
    }

    static encodeDefaultIcons(graphType, attribute, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.defaults.${graphType}.icon`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'icon', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultPointIcons(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultIcons.apply(this, args);
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultEdgeIcons(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultIcons.apply(this, args);
    }

    static encodeDefaultSize(graphType, attribute, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.defaults.${graphType}.size`,
                {   reset: attribute === undefined, name: 'user_' + Math.random(),
                    encodingType: 'size', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultPointSize(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultSize.apply(this, args);
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultEdgeSize(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultSize.apply(this, args);
    }

    static encodeDefaultColor(graphType, attribute, variation, mapping) {
        const { view } = this;
        return new this(view.set(
            $value(`encodings.defaults.${graphType}.color`,
                {   reset: attribute === undefined, variation, name: 'user_' + Math.random(),
                    encodingType: 'color', graphType, attribute, mapping }))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }  
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultPointColor(opts) {
        const args = ['point'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultColor.apply(this, args);
    }
    //helper just for react bindings
    // undefined (reset)
    // str (attr)
    // [str, obj] (attr, mapping)
    static encodeDefaultEdgeColor(opts) {
        const args = ['edge'];
        if (opts !== undefined) {
            const attribute = opts instanceof Array ? opts[0] : opts;
            args.push(attribute);
            if (opts instanceof Array && opts.length > 1) {
                const mapping = opts[1];
                args.push(mapping);
            }
        }
        return this.encodeDefaultColor.apply(this, args);
    }


    /**
     * Toggle inspector panel
     * @method Graphistry.toggleInspector
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('opening inspector panel');
     *         return g.toggleInspector(true);
     *     })
     *     .subscribe();
     */
    static toggleInspector(turnOn) {
        const { view } = this;
        if (!turnOn) {
            return new this(view.set(
                $value(`panels.bottom`, undefined),
                $value(`inspector.controls[0].selected`, false),
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        } else {
            return new this(view.set(
                $value(`inspector.controls[0].selected`, true),
                $value(`panels.bottom`, $ref(view._path.concat(`inspector`)))
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        }
    }

    /**
     * Toggle timebars panel
     * @method Graphistry.toggleTimebars
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('opening timebards panel');
     *         return g.toggleTimebars(true);
     *     })
     *     .subscribe();
     */
    static toggleTimebars(turnOn) {
        const { view } = this;
        if (!turnOn) {
            return new this(view.set(
                $value(`panels.bottom`, undefined),
                $value(`timebars.controls[0].selected`, false),
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        } else {
            return new this(view.set(
                $value(`timebars.controls[0].selected`, true),
                $value(`panels.bottom`, $ref(view._path.concat(`timebars`)))
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        }
    }

    /**
     * Toggle histogram panel
     * @method Graphistry.toggleHistograms
     * @param {boolean} [turnOn] - Whether to make panel visible
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *  GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('opening histogram panel');
     *         return g.toggleHistograms(true);
     *     })
     *     .subscribe();
     */
    static toggleHistograms(turnOn) {
        const { view } = this;
        if (!turnOn) {
            return new this(view.set(
                $value(`panels.right`, undefined),
                $value(`histograms.controls[0].selected`, false)
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        } else {
            return new this(view.set(
                $value(`histograms.controls[0].selected`, true),
                $value(`panels.right`, $ref(view._path.concat(`histograms`)))
            )
            .map(({ json }) => json.toJSON())
            .toPromise());
        }
    }

    /**
     * Run a number of steps of Graphistry's clustering algorithm
     * @method Graphistry.tickClustering
     * @static
     * @param {number} ticks - The number of ticks to run
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('starting to cluster');
     *         return g.tickClustering();
     *     })
     *     .subscribe();
     */
    static tickClustering(ticks = 1) {

        let obs;
        const { view } = this;

        if (typeof ticks !== 'number') {
            obs = Observable.of({});
        } else {
            obs = Observable
                .timer(0, 40)
                .take(Math.abs(ticks) || 1)
                .concatMap(() => view.call('tick', []))
                .takeLast(1);
        }

        return new this(obs.toPromise());
    }

    /**
     * Center the view of the graph
     * @method Graphistry.autocenter
     * @todo Implement this function
     * @static
     * @param {number} percentile - Controls sensitivity to outliers
     * @param {function} [cb] - Callback function of type callback(error, result)
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('centering');
     *         return g.autocenter(.90);
     *     })
     *     .subscribe();
     */
    static autocenter(percentile, cb) {

    }

    /**
     * Read the workbook ID
     * @method Graphistry.getCurrentWorkbook
     * @static
     * @param {function} [cb] - Callback function of type callback(error, result)
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('getting workbook id');
     *         return g.getCurrentWorkbook();
     *     })
     *     .subscribe(function (workbook) {
     *         alert('id: ' + workbook.id)
     *     });
     */
    static getCurrentWorkbook() {
        const { workbook } = this;
         return new this(workbook.get('id')
            .map(({ json }) => json.toJSON())
            .toPromise());
    }

    /**
     * Save the current workbook. A saved workbook will persist the analytics state
     * of the visualization, including active filters and exclusions
     * @method Graphistry.saveWorkbook
     * @static
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         return g.saveWorkbook();
     *     })
     *     .subscribe();
     */
    static saveWorkbook() {

        const { workbook } = this;

        return new this(workbook.call('save', [])
            .map(({ json }) => json.toJSON())
            .toPromise());
    }


    /**
     * Hide or Show Toolbar UI
     * @method Graphistry.toogleToolbar
     * @static
     * @param {boolean} show - Set to true to show toolbar, and false to hide toolbar.
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     *
     * <button onclick="window.graphistry.toggleToolbar(false)">Hide toolbar</button>
     * <button onclick="window.graphistry.toggleToolbar(true)">Show toolbar</button>
     *
     */
    static toggleToolbar(show) {
        return this.updateSetting('showToolbar', !!show);
    }

    /**
     * Add a filter to the visualization with the given expression
     * @method Graphistry.addFilter
     * @static
     * @param {string} expr - An expression using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('Adding filter for "point:degree > 0"');
     *         return g.addFilter('point:degree > 0');
     *     })
     *     .subscribe();
     */
    static addFilter(expr) {

        const { view } = this;

        return new this(view.call('filters.add', [expr])
            .map(({ json }) => json.toJSON())
            .toPromise());
    }
    static addFilters(expr) {

        if (typeof(expr) === 'string') {
            return this.addFilter(expr);
        }

        let filtered = null;
        for (let e of expr) {
            if (filtered === null) {
                filtered = this.addFilter(e);
            } else {
                filtered = filtered.flatMap(() => this.addFilter(e));
            }
        }
        return filtered;
    }

    /**
     * Add an exclusion to the visualization with the given expression
     * @method Graphistry.addExclusion
     * @static
     * @param {string} expr - An expression using the same language as our in-tool
     * exclusion and filter panel
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('Adding exclusion for "point:degree > 0"');
     *         return g.addExclusion('point:degree > 0');
     *     })
     *     .subscribe();
     */
    static addExclusion(expr) {
        const { view } = this;

        return new this(view.call('exclusions.add', [expr])
            .map(({ json }) => json.toJSON())
            .toPromise());
    }

    static addExclusions(expr) {

        if (typeof(expr) === 'string') {
            return this.addExclusion(expr);
        }

        let filtered = null;
        for (let e of expr) {
            if (filtered === null) {
                filtered = this.addExclusion(e);
            } else {
                filtered = filtered.flatMap(() => this.addExclusion(e));
            }
        }
        return filtered;
    }

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
     * | `dissuadeHubs` | `boolean` | 
     * | `lockedX` | `boolean` | 
     * | `lockedY` | `boolean` | 
     * | `lockedR` | `boolean` | 
     * @method Graphistry.updateSetting
     * @static
     * @param {string} name - the name of the setting to change
     * @param {string} val - the value to set the setting to.
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     */
    static updateSetting(name, val) {

        const lookup = {

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

        const [model, path] = lookup[name];

        return new this(this[model]
            .set($value(path, $atom(val, { $timestamp: Date.now() })))
            .map(({ json }) => json.toJSON())
            .toPromise());
    }

    /**
     * Update the camera zoom level
     * @method Graphistry.updateZoom
     * @static
     * @param {number} level - Controls how far to zoom in or out.
     * @param {string} val - the value to set the setting to.
     * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
     */
    static updateZoom(level) {
        return this.updateSetting('zoom', level);
    }

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
     * @method Graphistry.labelUpdates
     * @static
     * @return {Observable<Observable<LabelEvent>>} An {@link Observable} of inner {Observables}, where each
     * inner {@link Observable} represents the lifetime of a label in the visualization.
     * @example
     * GraphistryJS(document.getElementById('viz'))
     *     .flatMap(function (g) {
     *         window.g = g;
     *         console.log('Listening for label updates');
     *         return g.labelUpdates();
     *     })
     *     .flatMap(function (labelUpdates) {
     *         return labelUpdates
     *             .do(function ({ id, tag, pageX, pageY }) {
     *                 // prints messages like
     *                 // > 'Label 13 added at (200, 340)'
     *                 // > 'Label 74 updated at (750, 100)'
     *                 console.log(`Label ${id} ${tag} at (${pageX}, ${pageY})`);
     *             })
     *             .takeLast(1)
     *             .do(function ({ id, pageX, pageY }) {
     *                 console.log(`Label ${id} removed at (${pageX}, ${pageY})`);
     *             });
     *     })
     *     .subscribe();
     */
    static labelUpdates() {
        return this.labelsStream || (this.labelsStream = this
            .fromEvent(window, 'message')
            .pluck('data')
            .filter((data) => data && data.type === 'labels-update')
            .multicast(() => new ReplaySubject(1))
            .let((connectable) => connectable.connect() && connectable.refCount())
            .scan((memo, { labels, simulating, semanticZoomLevel }) => {

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
            }, {
                newSources: [],
                sources: Object.create(null),
                prevLabelsById: Object.create(null),
            })
            .mergeMap(({ newSources }) => newSources)
        );
    }

    /**
     * Subscribe to label change and exit events
     * @method Graphistry.subscribeLabels
     * @static
     * @param {Object} - An Object with `onChange` and `onExit` callbacks
     * @return {Subscription} A {@link Subscription} that can be used to stop reacting to label updates
     */
    static subscribeLabels({ onChange, onExit }) {
        return this.labelUpdates().mergeMap((group) => group
            .do((event) => onChange && onChange(event))
            .takeLast(1)
            .do((event) => onExit && onExit(event))
        )
        .subscribe();
    }
}
Graphistry.view = null;
Graphistry.model = null;
Graphistry.workbook = null;

/**
 * Function that creates a Graphistry Wrapped IFrame
 * @func GraphistryJS
 * @param {Object} IFrame - An IFrame that hosts a Graphistry visualization.
 * @return {@link Graphistry}
 * @example
 *
 * <iframe id="viz" src="https://hub.graphistry.com/graph/graph.html?dataset=Miserables" />
 * <script>
 * document.addEventListener("DOMContentLoaded", function () {
 *
 *     GraphistryJS(document.getElementById('viz'))
 *         .flatMap(function (g) {
 *             window.g = g;
 *             document.getElementById('controls').style.opacity=1.0;
 *             console.log('opening filters');
 *             return g.openFilters();
 *         })
 *         .delay(5000)
 *         .flatMap(function() {
 *             console.log('filters opened');
 *             const columns = [
 *                 ['edge', 'highways', [66, 101, 280], 'number'],
 *                 ['point', 'theme parks', ['six flags', 'disney world', 'great america'], 'string']
 *             ];
 *             console.log('adding columns', columns);
 *             return g.addColumns.apply(g, columns);
 *        })
 *         .subscribe(function (result) {
 *             console.log('all columns: ', result);
 *         });
 * });
 * </script>
 *
 */
function GraphistryJS(iFrame) {

    if (!iFrame) {
        throw new Error('No iframe provided to Graphistry');
    }

    return Graphistry
        .fromEvent(iFrame, 'load', ({ target }) => target)
        .startWith(iFrame) // say hello first and on each load
        .map((target) => target.contentWindow)
        .do((target) => target && target.postMessage && (
            console.log(`Graphistry API: connecting to client`) ||
            target.postMessage({
                type: 'ready', agent: 'graphistryjs'
            }, '*'))
        )
        .switchMap(
            (target) => Graphistry
                .fromEvent(window, 'message')
                .filter(({ data }) => data && data.type === 'init' && data.cache),
            (target, { cache }) => ({ target, cache })
        )
        .switchMap(({ target, cache }) => {

            const model = new Model({
                cache,
                recycleJSON: true,
                scheduler: Scheduler.async,
                allowFromWhenceYouCame: true
            });

            model._source = new PostMessageDataSource(window, target, model, '*');

            class InstalledGraphistry extends Graphistry {
                lift(operator) {
                    const observable = new InstalledGraphistry(this);
                    observable.operator = operator;
                    return observable;
                }
            }
            InstalledGraphistry.model = model;

            InstalledGraphistry = wrapStaticObservableMethods(Observable, InstalledGraphistry);

            return model.get(`workbooks.open.views.current.id`).map(({ json }) => {
                InstalledGraphistry.workbook = model.deref(json.workbooks.open);
                InstalledGraphistry.view = model.deref(json.workbooks.open.views.current);
                console.log(`Graphistry API: connected to client`);
                return InstalledGraphistry;
            });
        })
        .multicast(() => new ReplaySubject(1))
        .refCount();
}

Graphistry = wrapStaticObservableMethods(Observable, Graphistry);

GraphistryJS.Subject = Subject;
GraphistryJS.Scheduler = Scheduler;
GraphistryJS.Observable = Observable;
GraphistryJS.AsyncSubject = AsyncSubject;
GraphistryJS.ReplaySubject = ReplaySubject;
GraphistryJS.$$observable = $$observable;

export { GraphistryJS };

function wrapStaticObservableMethods(Observable, Graphistry) {
    function createStaticWrapper(staticMethodName) {
        return function(...args) {
            return new Graphistry(Observable[staticMethodName](...args));
        }
    }
    for (const staticMethodName in Observable) {
        Graphistry[staticMethodName] = createStaticWrapper(staticMethodName);
    }
    Graphistry.bindCallback = (...args) => (...args2) => new Graphistry(Observable.bindCallback(...args)(...args2));
    Graphistry.bindNodeCallback = (...args) => (...args2) => new Graphistry(Observable.bindNodeCallback(...args)(...args2));
    return Graphistry;
}

//esbuild not exposing some reason
try {
    window.GraphistryJS = GraphistryJS;
} catch (e) {
    //not browser
}

/**
 * A LabelEvent is dispatched by the inner Observables emitted by the labelUpdates() {@link Observable}.
 * A LabelEvent is generated for each label update in the visualization.
 * @typedef {Object} LabelEvent
 * @property {number} id - the integer ID for the element the label describes
 * @property {String} tag - a string that describes the update kind, either 'added' or 'updated'
 * @property {String} type - the graph component type for the element the label describes, either 'edge' or 'point'
 * @property {number} size - the size in pixels of the element the label describes. This is 0 for edges, and the diameter for points
 * @property {number} pageX - the pageX of the element the label describes
 * @property {number} pageY - the pageY of the element the label describes
 * @property {boolean} selected - a boolean that describes whether element the label describes is selected
 * @property {boolean} highlight - a boolean that describes whether element the label describes is highlighted
 * @property {boolean} simulating - a boolean that indicates the visualization is running clustering
 * @property {number} semanticZoomLevel - the semantic zoom level of the visualization
 */

/**
 * @constructor Observable
 * @see {@link https://github.com/ReactiveX/rxjs/blob/master/doc/observable.md}
 */

 /**
 * The subscribe method triggers the execution of the {@link Observable}, causing the values within to be pushed to a callback. An {@link Observable} is like a pipe of water that is closed. When subscribe is called, we open the valve and the values within are pushed at us.  These values can be received using either callbacks or an {@link Observer} object.
 * @name subscribe
 * @memberof Observable.prototype
 * @function
 * @arg {?Observable~nextCallback} next a callback that accepts the next value in the stream of values
 * @arg {?Observable~errorCallback} error a callback that accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream
 * @arg {?Observable~completeCallback} completed a callback that is invoked when the {@link Observable} stream has ended, and the {@link Observable~nextCallback} will not receive any more values
 * @return {Subscription}
 */

/**
 * This callback accepts a value that was emitted while evaluating the operation underlying the {@link Observable} stream.
 * @callback Observable~nextCallback
 * @param {Object} value the value that was emitted while evaluating the operation underlying the {@link Observable}
 */

/**
 * This callback accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream. When this callback is invoked, the {@link Observable} stream ends and no more values will be received by the {@link Observable~nextCallback}.
 * @callback Observable~errorCallback
 * @param {Error} error the error that occurred while evaluating the operation underlying the {@link Observable}
 */

 /**
 * This callback is invoked when the {@link Observable} stream ends. When this callback is invoked the {@link Observable} stream has ended, and therefore the {@link Observable~nextCallback} will not receive any more values.
 * @callback Observable~completeCallback
 */

/**
 * @constructor Subscription
 * @see {@link https://github.com/ReactiveX/rxjs/blob/master/doc/subscription.md}
 */

/**
 * When this method is called on the Subscription, the {@link Observable} that created the Subscription will stop sending values to the callbacks passed when the Subscription was created.
 * @name unsubscribe
 * @method
 * @memberof Subscription.prototype
 */

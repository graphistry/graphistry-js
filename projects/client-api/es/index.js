var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import shallowEqual from 'recompose/shallowEqual';
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

var Graphistry = function (_Observable) {
    _inherits(Graphistry, _Observable);

    /**
     * Create Graphistry {@link Observable} by extending observable's methods
     * @param {Object} source - The source observable.
     */
    function Graphistry(source) {
        _classCallCheck(this, Graphistry);

        if (!source || typeof source === 'function' || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
            var _this = _possibleConstructorReturn(this, (Graphistry.__proto__ || Object.getPrototypeOf(Graphistry)).call(this, source));
        } else {
            var _this = _possibleConstructorReturn(this, (Graphistry.__proto__ || Object.getPrototypeOf(Graphistry)).call(this));

            if (typeof source[$$observable] === 'function') {
                _this.source = source[$$observable]();
            } else {
                _this.source = _this.constructor.from(source);
            }
        }
        return _possibleConstructorReturn(_this);
    }

    /**
     * Creates a new {@link Observable} with this as the source, and the passed
     * operator as the new Observable's operator.
     * @method Graphistry~lift
     * @param {Operator} operator - the operator defining the operation to apply to the {@link Observable}
     * @return {@link Observable} a new {@link Observable} with the operator applied
     */


    _createClass(Graphistry, [{
        key: 'lift',
        value: function lift(operator) {
            var observable = new Graphistry(this);
            observable.operator = operator;
            return observable;
        }
    }], [{
        key: '_getIds',
        value: function _getIds(componentType, name, dataType) {
            var values = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var view = this.view;

            return new this(view.call('componentsByType[\'' + componentType + '\'].rows.filter', [name, dataType, values], ['_index']).takeLast(1).map(function (_ref) {
                var _ref$json = _ref.json,
                    json = _ref$json === undefined ? {} : _ref$json;
                var _json$componentsByTyp = json.componentsByType,
                    componentsByType = _json$componentsByTyp === undefined ? {} : _json$componentsByTyp;
                var _componentsByType$com = componentsByType[componentType],
                    componentsForType = _componentsByType$com === undefined ? {} : _componentsByType$com;
                var _componentsForType$ro = componentsForType.rows,
                    rows = _componentsForType$ro === undefined ? {} : _componentsForType$ro;

                return Array.from(rows.filter || []).filter(Boolean).map(function (_ref2) {
                    var _index = _ref2._index;
                    return _index;
                });
            }).toPromise());
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

    }, {
        key: 'addColumns',
        value: function addColumns() {
            for (var _len = arguments.length, columns = Array(_len), _key = 0; _key < _len; _key++) {
                columns[_key] = arguments[_key];
            }

            var view = this.view;

            return new this(this.from(columns).concatMap(function (column) {
                return view.call('columns.add', column);
            }).map(function (_ref3) {
                var columns = _ref3.json.columns;
                return columns;
            }).filter(Boolean).map(function (columns) {
                return columns[columns.length - 1].toJSON();
            }).toArray().toPromise());
        }

        /**
        * Change colors based on an attribute
        * @method Graphistry.encodeColor
        * @param {GraphType} [graphType] - 'point' or 'edge'
        * @param {Attribute} [attribute] - name of data column, e.g., 'degree'
        * @param {Variant} [variation] - If there are more bins than colors, use 'categorical' to repeat colors and 'continuous' to interpolate
        * @param {Array} [colors] - array of color name or hex codes
        * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
        * @example
        *  GraphistryJS(document.getElementById('viz'))
        *     .flatMap(function (g) {
        *         window.g = g;
        *         return g.encodeColor('point', 'degree', 'categorical', ['black', 'white'])
        *     })
        *     .subscribe();
        */

    }, {
        key: 'encodeColor',
        value: function encodeColor(graphType, attribute, variation, colors) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.color', { reset: false, variation: variation, name: 'user_' + Math.random(),
                encodingType: 'color', colors: colors, graphType: graphType, attribute: attribute })).map(function (_ref4) {
                var json = _ref4.json;
                return json.toJSON();
            }).toPromise());
        }

        /**
        * Reset color to value at page load
        * @method Graphistry.resetColor
        * @param {GraphType} [graphType] - 'point' or 'edge'
        * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
        * @example
        *  GraphistryJS(document.getElementById('viz'))
        *     .flatMap(function (g) {
        *         window.g = g;
        *         return g.encodeColor('point', 'degree', 'categorical', ['black', 'white'])
        *         return g.resetColor('point')
        *     })
        *     .subscribe();
        */

    }, {
        key: 'resetColor',
        value: function resetColor(graphType) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.color', { reset: true, encodingType: 'color' })).map(function (_ref5) {
                var json = _ref5.json;
                return json.toJSON();
            }).toPromise());
        }

        //=========


        /**
        * Change icons based on an attribute
        * @method Graphistry.encodeIcons
        * @param {GraphType} [graphType] - 'point' or 'edge'
        * @param {Attribute} [attribute] - name of data column, e.g., 'icon'
        * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
        * @example
        *  GraphistryJS(document.getElementById('viz'))
        *     .flatMap(function (g) {
        *         window.g = g;
        *         return g.encodeIcons('point', 'icon')
        *     })
        *     .subscribe();
        */

    }, {
        key: 'encodeIcons',
        value: function encodeIcons(graphType, attribute) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.icon', { reset: false, name: 'user_' + Math.random(),
                encodingType: 'icon', graphType: graphType, attribute: attribute })).map(function (_ref6) {
                var json = _ref6.json;
                return json.toJSON();
            }).toPromise());
        }

        /**
        * Reset icons to value at page load
        * @method Graphistry.resetIcons
        * @param {GraphType} [graphType] - 'point' or 'edge'
        * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
        * @example
        *  GraphistryJS(document.getElementById('viz'))
        *     .flatMap(function (g) {
        *         window.g = g;
        *         return g.encodeIcons('point', 'icon')
        *         return g.resetIcons('point')
        *     })
        *     .subscribe();
        */

    }, {
        key: 'resetIcons',
        value: function resetIcons(graphType) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.icon', { reset: true, encodingType: 'icon' })).map(function (_ref7) {
                var json = _ref7.json;
                return json.toJSON();
            }).toPromise());
        }

        //=========


        /**
         * Change size based on an attribute
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

    }, {
        key: 'encodeSize',
        value: function encodeSize(graphType, attribute) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.size', { reset: false, name: 'user_' + Math.random(),
                encodingType: 'size', graphType: graphType, attribute: attribute })).map(function (_ref8) {
                var json = _ref8.json;
                return json.toJSON();
            }).toPromise());
        }

        /**
         * Reset size to value at page load
         * @method Graphistry.resetSize
         * @param {GraphType} [graphType] - 'point'
         * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
         * @example
         *  GraphistryJS(document.getElementById('viz'))
         *     .flatMap(function (g) {
         *         window.g = g;
         *         return g.encodeSize('point', 'community_infomap')
         *         return g.resetSize('point')
         *     })
         *     .subscribe();
         */

    }, {
        key: 'resetSize',
        value: function resetSize(graphType) {
            var view = this.view;

            return new this(view.set($value('encodings.' + graphType + '.size', { reset: true, encodingType: 'size' })).map(function (_ref9) {
                var json = _ref9.json;
                return json.toJSON();
            }).toPromise());
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

    }, {
        key: 'togglePanel',
        value: function togglePanel(panel, turnOn) {
            var view = this.view;

            if (turnOn) {
                return new this(view.set($value('filters.controls[0].selected', panel === 'filters'), $value('scene.controls[1].selected', panel === 'scene'), $value('labels.controls[0].selected', panel === 'labels'), $value('layout.controls[0].selected', panel === 'layout'), $value('exclusions.controls[0].selected', panel === 'exclusions'), $value('panels.left', panel === 'filters' ? $ref(view._path.concat('filters')) : panel === 'scene' ? $ref(view._path.concat('scene')) : panel === 'labels' ? $ref(view._path.concat('labels')) : panel === 'layout' ? $ref(view._path.concat('layout')) : $ref(view._path.concat('exclusions')))).map(function (_ref10) {
                    var json = _ref10.json;
                    return json.toJSON();
                }).toPromise());
            } else {
                return new this(view.set($value('panels.left', undefined), $value('filters.controls[0].selected', false), $value('scene.controls[1].selected', false), $value('labels.controls[0].selected', false), $value('layout.controls[0].selected', false), $value('exclusions.controls[0].selected', false)).map(function (_ref11) {
                    var json = _ref11.json;
                    return json.toJSON();
                }).toPromise());
            }
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

    }, {
        key: 'toggleInspector',
        value: function toggleInspector(turnOn) {
            var view = this.view;

            if (!turnOn) {
                return new this(view.set($value('panels.bottom', undefined), $value('inspector.controls[0].selected', false)).map(function (_ref12) {
                    var json = _ref12.json;
                    return json.toJSON();
                }).toPromise());
            } else {
                return new this(view.set($value('inspector.controls[0].selected', true), $value('panels.bottom', $ref(view._path.concat('inspector')))).map(function (_ref13) {
                    var json = _ref13.json;
                    return json.toJSON();
                }).toPromise());
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

    }, {
        key: 'toggleHistograms',
        value: function toggleHistograms(turnOn) {
            var view = this.view;

            if (!turnOn) {
                return new this(view.set($value('panels.right', undefined), $value('histograms.controls[0].selected', false)).map(function (_ref14) {
                    var json = _ref14.json;
                    return json.toJSON();
                }).toPromise());
            } else {
                return new this(view.set($value('histograms.controls[0].selected', true), $value('panels.right', $ref(view._path.concat('histograms')))).map(function (_ref15) {
                    var json = _ref15.json;
                    return json.toJSON();
                }).toPromise());
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

    }, {
        key: 'tickClustering',
        value: function tickClustering() {
            var ticks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;


            var obs = void 0;
            var view = this.view;


            if (typeof ticks !== 'number') {
                obs = Observable.of({});
            } else {
                obs = Observable.timer(0, 40).take(Math.abs(ticks) || 1).concatMap(function () {
                    return view.call('tick', []);
                }).takeLast(1);
            }

            return new this(obs.toPromise());
        }

        /**
         * Center the view of the graph
         * @method Graphistry.autocenter
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

    }, {
        key: 'autocenter',
        value: function autocenter(percentile, cb) {}

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

    }, {
        key: 'getCurrentWorkbook',
        value: function getCurrentWorkbook() {
            var workbook = this.workbook;

            return new this(workbook.get('id').map(function (_ref16) {
                var json = _ref16.json;
                return json.toJSON();
            }).toPromise());
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

    }, {
        key: 'saveWorkbook',
        value: function saveWorkbook() {
            var workbook = this.workbook;


            return new this(workbook.call('save', []).map(function (_ref17) {
                var json = _ref17.json;
                return json.toJSON();
            }).toPromise());
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

    }, {
        key: 'toggleToolbar',
        value: function toggleToolbar(show) {
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

    }, {
        key: 'addFilter',
        value: function addFilter(expr) {
            var view = this.view;


            return new this(view.call('filters.add', [expr]).map(function (_ref18) {
                var json = _ref18.json;
                return json.toJSON();
            }).toPromise());
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

    }, {
        key: 'addExclusion',
        value: function addExclusion(expr) {
            var view = this.view;


            return new this(view.call('exclusions.add', [expr]).map(function (_ref19) {
                var json = _ref19.json;
                return json.toJSON();
            }).toPromise());
        }

        /**
         * Modify a settings value in the visualization
         * Key settings: showArrows, pruneOrphans, edgeOpacity, edgeSize, pointOpacity,
         * pointSize, labelOpacity, labelEnabled, labelPOI, labelHighlightEnabled, zoom
         * @method Graphistry.updateSetting
         * @static
         * @param {string} name - the name of the setting to change
         * @param {string} val - the value to set the setting to.
         * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
         */

    }, {
        key: 'updateSetting',
        value: function updateSetting(name, val) {

            var lookup = {

                //models/toolbar.js
                'showToolbar': ['view', 'toolbar.visible'],

                //models/scene/scene.js
                'pruneOrphans': ['view', 'pruneOrphans'],
                'showArrows': ['view', 'scene.renderer.showArrows'],
                'background': ['view', 'scene.renderer.background.color'],
                'edgeOpacity': ['view', 'scene.renderer.edges.opacity'],
                'edgeSize': ['view', 'scene.renderer.edges.scaling'],
                'pointOpacity': ['view', 'scene.renderer.points.opacity'],
                'pointSize': ['view', 'scene.renderer.points.scaling'],

                //models/camera.js
                'zoom': ['view', 'camera.zoom'],
                'center': ['view', 'camera.center["x", "y", "z"]'],

                //models/label.js
                'labelOpacity': ['view', 'labels.opacity'],
                'labelEnabled': ['view', 'labels.enabled'],
                'labelPOI': ['view', 'labels.poiEnabled'],
                'labelHighlightEnabled': ['view', 'labels.highlightEnabled'],
                'labelColor': ['view', 'labels.foreground.color'],
                'labelBackground': ['view', 'labels.background.color'],

                //models/layout.js => viz-worker/simulator/layout.config.js:
                'precisionVsSpeed': ['view', 'layout.options.tau.value']

            };

            var _lookup$name = _slicedToArray(lookup[name], 2),
                model = _lookup$name[0],
                path = _lookup$name[1];

            return new this(this[model].set($value(path, $atom(val, { $timestamp: Date.now() }))).map(function (_ref20) {
                var json = _ref20.json;
                return json.toJSON();
            }).toPromise());
        }

        /**
         * Update the camera zoom level
         * @method Graphistry.updateZoom
         * @static
         * @param {string} level - Controls how far to zoom in or out.
         * @param {string} val - the value to set the setting to.
         * @return {@link Graphistry} A {@link Graphistry} {@link Observable} that emits the result of the operation
         */

    }, {
        key: 'updateZoom',
        value: function updateZoom(level) {
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

    }, {
        key: 'labelUpdates',
        value: function labelUpdates() {
            return this.labelsStream || (this.labelsStream = this.fromEvent(window, 'message').pluck('data').filter(function (data) {
                return data && data.type === 'labels-update';
            }).multicast(function () {
                return new ReplaySubject(1);
            })['let'](function (connectable) {
                return connectable.connect() && connectable.refCount();
            }).scan(function (memo, _ref21) {
                var labels = _ref21.labels,
                    simulating = _ref21.simulating,
                    semanticZoomLevel = _ref21.semanticZoomLevel;


                labels = labels || [];
                var updates = [],
                    newSources = [];
                var labelsById = Object.create(null);
                var nextSources = Object.create(null);
                var sources = memo.sources,
                    prevLabelsById = memo.prevLabelsById;

                var idx = -1,
                    len = labels.length,
                    label = void 0;

                while (++idx < len) {
                    var source = void 0;
                    label = labels[idx];
                    var _label = label,
                        id = _label.id;


                    if (id in sources) {
                        source = sources[id];
                        delete sources[id];
                        if (memo.simulating !== simulating || memo.semanticZoomLevel !== semanticZoomLevel || !shallowEqual(prevLabelsById[id], label)) {
                            updates.push(_extends({}, label, { simulating: simulating, semanticZoomLevel: semanticZoomLevel, tag: 'updated' }));
                        }
                    } else {
                        newSources.push(source = new ReplaySubject(1));
                        updates.push(_extends({}, label, { simulating: simulating, semanticZoomLevel: semanticZoomLevel, tag: 'added' }));
                        source.key = id;
                    }

                    labelsById[id] = label;
                    nextSources[id] = source;
                }

                for (var id in sources) {
                    sources[id].complete();
                }

                idx = -1;
                len = updates.length;
                while (++idx < len) {
                    label = updates[idx];
                    nextSources[label.id].next(label);
                }

                return {
                    newSources: newSources,
                    simulating: simulating,
                    semanticZoomLevel: semanticZoomLevel,
                    sources: nextSources,
                    prevLabelsById: labelsById
                };
            }, {
                newSources: [],
                sources: Object.create(null),
                prevLabelsById: Object.create(null)
            }).mergeMap(function (_ref22) {
                var newSources = _ref22.newSources;
                return newSources;
            }));
        }

        /**
         * Subscribe to label change and exit events
         * @method Graphistry.subscribeLabels
         * @static
         * @param {Object} - An Object with `onChange` and `onExit` callbacks
         * @return {Subscription} A {@link Subscription} that can be used to stop reacting to label updates
         */

    }, {
        key: 'subscribeLabels',
        value: function subscribeLabels(_ref23) {
            var onChange = _ref23.onChange,
                onExit = _ref23.onExit;

            return this.labelUpdates().mergeMap(function (group) {
                return group['do'](function (event) {
                    return onChange && onChange(event);
                }).takeLast(1)['do'](function (event) {
                    return onExit && onExit(event);
                });
            }).subscribe();
        }
    }]);

    return Graphistry;
}(Observable);

/**
 * Function that creates a Graphistry Wrapped IFrame
 * @func GraphistryJS
 * @param {Object} IFrame - An IFrame that hosts a Graphistry visualization.
 * @return {@link Graphistry}
 * @example
 *
 * <iframe id="viz" src="https://labs.graphistry.com/graph/graph.html?dataset=Miserables" />
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


Graphistry.view = null;
Graphistry.model = null;
Graphistry.workbook = null;
function GraphistryJS(iFrame) {

    if (!iFrame) {
        throw new Error('No iframe provided to Graphistry');
    }

    return Graphistry.fromEvent(iFrame, 'load', function (_ref24) {
        var target = _ref24.target;
        return target;
    }).startWith(iFrame) // say hello first and on each load
    .map(function (target) {
        return target.contentWindow;
    })['do'](function (target) {
        return target && target.postMessage && (console.log('Graphistry API: connecting to client') || target.postMessage({
            type: 'ready', agent: 'graphistryjs'
        }, '*'));
    }).switchMap(function (target) {
        return Graphistry.fromEvent(window, 'message').filter(function (_ref25) {
            var data = _ref25.data;
            return data && data.type === 'init' && data.cache;
        });
    }, function (target, _ref26) {
        var cache = _ref26.cache;
        return { target: target, cache: cache };
    }).switchMap(function (_ref27) {
        var target = _ref27.target,
            cache = _ref27.cache;


        var model = new Model({
            cache: cache,
            recycleJSON: true,
            scheduler: Scheduler.async,
            allowFromWhenceYouCame: true
        });

        model._source = new PostMessageDataSource(window, target, model, '*');

        var InstalledGraphistry = function (_Graphistry) {
            _inherits(InstalledGraphistry, _Graphistry);

            function InstalledGraphistry() {
                _classCallCheck(this, InstalledGraphistry);

                return _possibleConstructorReturn(this, (InstalledGraphistry.__proto__ || Object.getPrototypeOf(InstalledGraphistry)).apply(this, arguments));
            }

            _createClass(InstalledGraphistry, [{
                key: 'lift',
                value: function lift(operator) {
                    var observable = new InstalledGraphistry(this);
                    observable.operator = operator;
                    return observable;
                }
            }]);

            return InstalledGraphistry;
        }(Graphistry);

        InstalledGraphistry.model = model;


        InstalledGraphistry = wrapStaticObservableMethods(Observable, InstalledGraphistry);

        return model.get('workbooks.open.views.current.id').map(function (_ref28) {
            var json = _ref28.json;

            InstalledGraphistry.workbook = model.deref(json.workbooks.open);
            InstalledGraphistry.view = model.deref(json.workbooks.open.views.current);
            console.log('Graphistry API: connected to client');
            return InstalledGraphistry;
        });
    }).multicast(function () {
        return new ReplaySubject(1);
    }).refCount();
}

Graphistry = wrapStaticObservableMethods(Observable, Graphistry);

export { GraphistryJS };
// export default GraphistryJS;

function wrapStaticObservableMethods(Observable, Graphistry) {
    function createStaticWrapper(staticMethodName) {
        return function () {
            return new Graphistry(Observable[staticMethodName].apply(Observable, arguments));
        };
    }
    for (var staticMethodName in Observable) {
        Graphistry[staticMethodName] = createStaticWrapper(staticMethodName);
    }
    Graphistry.bindCallback = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return function () {
            return new Graphistry(Observable.bindCallback.apply(Observable, args).apply(undefined, arguments));
        };
    };
    Graphistry.bindNodeCallback = function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return function () {
            return new Graphistry(Observable.bindNodeCallback.apply(Observable, args).apply(undefined, arguments));
        };
    };
    return Graphistry;
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
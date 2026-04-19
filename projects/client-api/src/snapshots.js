// Snapshot types + projections from raw iframe payloads to stable shapes.
//
// The iframe emits graphistry-sub-update messages with domain-specific
// payload shapes. We project once, at the subscribe boundary, so
// consumers never see local row indices, falcor $refs, or partial
// JSON-graph fragments — just flat typed data.

/**
 * @typedef {Object} LabelEntry
 * @property {number} index
 * @property {string} title
 * @property {number} globalIndex
 * @property {string} [label]
 * @property {unknown} [value]
 * @property {Record<string, unknown>} [columns]
 */

/**
 * @typedef {Object} SelectionSnapshot
 * @property {number[]} points — globalIndex array
 * @property {number[]} edges — globalIndex array
 * @property {LabelEntry[]} pointLabels
 * @property {LabelEntry[]} edgeLabels
 * @property {boolean} ready
 * @property {Error|null} error
 */

/**
 * @typedef {Object} LabelsSnapshot
 * @property {LabelEntry[]} labels
 * @property {boolean} ready
 * @property {Error|null} error
 */

/**
 * @typedef {Object} FilterEntry
 * @property {string} [id]
 * @property {string} [query]
 * @property {boolean} [enabled]
 * @property {string} [name]
 * @property {string} [dataType]
 * @property {string} [level]
 */

/**
 * @typedef {Object} FiltersSnapshot
 * @property {FilterEntry[]} filters
 * @property {boolean} ready
 * @property {Error|null} error
 */

export const initialSelection = /** @type {SelectionSnapshot} */ ({
    points: [],
    edges: [],
    pointLabels: [],
    edgeLabels: [],
    ready: false,
    error: null,
});

export const initialLabels = /** @type {LabelsSnapshot} */ ({
    labels: [],
    ready: false,
    error: null,
});

export const initialFilters = /** @type {FiltersSnapshot} */ ({
    filters: [],
    ready: false,
    error: null,
});

function toLabelArray(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (typeof x === 'object') {
        // Falcor length-bearing pseudo-array, or a sparse indexed object.
        const len = typeof x.length === 'number' ? x.length : -1;
        if (len >= 0) {
            const out = [];
            for (let i = 0; i < len; i++) if (x[i]) out.push(x[i]);
            return out;
        }
        return Object.values(x).filter(Boolean);
    }
    return [];
}

/** @param {unknown} raw @returns {SelectionSnapshot} */
export function projectSelection(raw) {
    const data = raw || {};
    const pointLabels = toLabelArray(data.labels && data.labels.point);
    const edgeLabels = toLabelArray(data.labels && data.labels.edge);
    return {
        points: pointLabels.map((l) => l.globalIndex),
        edges: edgeLabels.map((l) => l.globalIndex),
        pointLabels,
        edgeLabels,
        ready: true,
        error: null,
    };
}

/** @param {unknown} raw @returns {LabelsSnapshot} */
export function projectLabels(raw) {
    const data = raw || {};
    return {
        labels: toLabelArray(data.labels !== undefined ? data.labels : raw),
        ready: true,
        error: null,
    };
}

/** @param {unknown} raw @returns {FiltersSnapshot} */
export function projectFilters(raw) {
    const data = raw || {};
    const src = data.filters !== undefined ? data.filters : raw;
    let filters = [];
    if (Array.isArray(src)) {
        filters = src;
    } else if (src && typeof src === 'object') {
        const len = typeof src.length === 'number' ? src.length : -1;
        if (len >= 0) {
            for (let i = 0; i < len; i++) if (src[i]) filters.push(src[i]);
        } else {
            filters = Object.values(src).filter(Boolean);
        }
    }
    return { filters, ready: true, error: null };
}

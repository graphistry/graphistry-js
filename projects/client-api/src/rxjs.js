import {
    AsyncSubject,
    catchError,
    forkJoin,
    fromEvent,
    of,
    Observable,
    pipe,
    retryWhen,
    ReplaySubject,
    BehaviorSubject,
    Subject,
    timer,
    finalize,
    throwError
} from 'rxjs';

import { ajax } from 'rxjs/ajax';

import {
    concatMap,
    delay,
    filter,
    first,
    isEmpty,
    last,
    map,
    mergeMap,
    mergeAll,
    scan,
    share,
    shareReplay,
    startWith,
    switchMap,
    take,
    takeLast,
    tap
} from 'rxjs/operators';


// //////////////////////////////////////////////////////////////////////////////
export {
    ajax,
    AsyncSubject,
    catchError,
    concatMap,
    delay,
    filter,
    first,
    forkJoin,
    fromEvent,
    isEmpty,
    last,
    map,
    mergeMap,
    mergeAll,
    Observable,
    of,
    pipe,
    ReplaySubject,
    retryWhen,
    scan,
    share,
    shareReplay,
    BehaviorSubject,
    startWith,
    Subject,
    switchMap,
    take,
    takeLast,
    tap,
    timer,
    finalize,
    throwError
};


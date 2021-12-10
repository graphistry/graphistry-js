import { 
    AsyncSubject,
    catchError,
    forkJoin,
    fromEvent,
    of,
    Observable,
    pipe,
    ReplaySubject,
    Subject,
    timer
} from 'rxjs';

import { ajax } from 'rxjs/ajax';

import {
    concatMap,
    delay,
    filter,
    isEmpty,
    last,
    map,
    mergeMap,
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
    forkJoin,
    fromEvent,
    isEmpty,
    last,
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
    Subject,
    switchMap,
    take,
    takeLast,
    tap,
    timer
};


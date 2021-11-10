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
    share,
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
    Observable,
    of,
    pipe,
    ReplaySubject,
    share,
    startWith,
    Subject,
    switchMap,
    take,
    takeLast,
    tap,
    timer
};


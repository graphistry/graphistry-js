import { 
    AsyncSubject,
    catchError,
    forkJoin,
    fromEvent,
    of,
    Observable,
    pipe,
    ReplaySubject,
    Subject
} from 'rxjs';

import { ajax } from 'rxjs/ajax';

import {
    filter,
    last,
    map,
    share,
    startWith,
    switchMap,
    tap
} from 'rxjs/operators';


// //////////////////////////////////////////////////////////////////////////////
export {
    ajax,
    AsyncSubject,
    catchError,
    filter,
    forkJoin,
    fromEvent,
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
    tap
};


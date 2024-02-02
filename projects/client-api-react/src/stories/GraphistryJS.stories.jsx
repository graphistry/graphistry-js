import React, { useRef, useState, useEffect } from 'react';
import '../../assets/index.css';
import { combineLatest } from 'rxjs';

import {
  //graphistry
  graphistryJS,
  updateSetting,
  addFilters,
  addExclusions,
  togglePanel,
  toggleToolbar,
  toggleHistograms,
  toggleTimebars,
  toggleClustering,
  toggleInspector,
  encodeAxis,
  selectionUpdates,
  tickClustering,

  //falcor
  makeCaller,

  //rxjs
  delay,
  filter,
  map,
  of,
  from,
  scan,
  switchMap,
  tap,
  take,
  timer,
  // Observable
} from '@graphistry/client-api';
import { interval, takeWhile } from 'rxjs';

//const basePath = 'https://hub.graphistry.com';
const basePath = 'http://localhost';
const lesMisPath = `${basePath}/graph/graph.html?dataset=Miserables`;
const lesMisConfigured = `${lesMisPath}&play=0`;
const lesMisNoPlayNoSplash = `${lesMisPath}&play=0&splashAfter=false`;

function GraphistryIFrame(args) {
  return <iframe src={lesMisConfigured} {...args} />;
}

export default {
  title: 'Graphistry: Vanilla JS',
  component: GraphistryIFrame,
};

const defaultIframeProps = {
  style: {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    border: 'none',
  },
  allowFullScreen: true,
};

export const PredefinedDataset = {
  render: (args) => <iframe src={lesMisConfigured} {...args} />,
};

export const InstantiateGraphistryJS = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub = graphistryJS(iframe.current).subscribe(
        (g) =>
          setMessages((arr) =>
            arr.concat([`graphistryJS instantiated: ${Object.keys(g).join(', ')}`])
          ),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed']))
      );
      ////////
      return () => sub.unsubscribe();
    }, [iframe]);

    return (
      <div>
        <h3>Instantiate GraphistryJS session for iframe</h3>
        <ol>
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ol>
        <iframe
          {...defaultIframeProps}
          ref={iframe}
          src={`${lesMisPath}&play=0&splashAfter=false`}
          {...args}
        />
      </div>
    );
  },
};

const SUBSCRIPTION_TEST = [
  { a: true, b: false },
  { a: true, b: true },
  { a: false, b: true },
  { a: true, b: true },
  { a: true, b: false },
  { a: false, b: false },
  { a: true, b: false },
  { a: false, b: false },
  { a: true, b: true },
];

const statusString = (a, b) => `${a ? 'A' : '..'} ${b ? 'B' : '..'}`;

// TODO: Move this to a testing file.
const GraphistryJSSubscribeToSelection = (args) => {
  const iframe = useRef(null);
  const [messages, setMessages] = useState(['loading...']);
  const pushMessage = (s) => setMessages((arr) => arr.concat([s]));
  const [valA, setValA] = useState(null);
  const [valB, setValB] = useState(null);

  useEffect(() => {
    if (!iframe.current) {
      return;
    }

    combineLatest([graphistryJS(iframe.current), graphistryJS(iframe.current)])
      .pipe(
        filter(([gA, gB]) => gA && gB),
        delay(1000), // Allow the viz iframe to initialize
        switchMap(([gA, gB]) => interval(1500).pipe(map((idx) => ({ idx, gA, gB })))),
        takeWhile(({ idx }) => idx < SUBSCRIPTION_TEST.length),
        tap(({ idx }) => {
          if (idx == 0) {
            pushMessage('Starting test');
            console.log('APISUB', 'Starting test');
          }
        }),
        scan(
          ({ A, B }, { gA, gB, idx }) => {
            const { a, b } = SUBSCRIPTION_TEST[idx];
            pushMessage(statusString(a, b));
            console.log('APISUB', statusString(A, B), ' -> ', statusString(a, b));

            if (a && !A) {
              A = selectionUpdates(gA).subscribe({
                next: (v) => {
                  setValB(v);
                  console.log('APISUB', 'Subscription A got selection', v);
                },
                error: (err) => console.error('APISUB', 'Subscription A got error', err),
                complete: () => console.log('APISUB', 'Subscription A completed'),
              });
            }

            if (!a && A) {
              A.unsubscribe();
              A = null;
            }

            if (b && !B) {
              B = selectionUpdates(gB).subscribe({
                next: (v) => {
                  setValA(v);
                  console.log('APISUB', 'Subscription B got selection', v);
                },
                error: (err) => console.error('APISUB', 'Subscription B got error', err),
                complete: () => console.log('APISUB', 'Subscription B completed'),
              });
            }

            if (!b && B) {
              B.unsubscribe();
              B = null;
            }

            return { A, B };
          },
          { A: null, B: null }
        )
      )
      .subscribe({
        error: (err) => pushMessage(`Error: ${err}`),
        complete: () => pushMessage('Completed'),
      });
  }, [iframe]);

  return (
    <div>
      <h3>Test subscribe and unsubscribe to selections.</h3>
      <p>Click or shift drag to make selextions in the viz.</p>
      <ul>
        <li>A: {JSON.stringify(valA)}</li>
        <li>B: {JSON.stringify(valB)}</li>
      </ul>
      <ol>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ol>
      <iframe
        {...defaultIframeProps}
        ref={iframe}
        src={`${lesMisPath}&play=0&splashAfter=false&session=cycle`}
        {...args}
      />
    </div>
  );
};
console.log('Not exporting', GraphistryJSSubscribeToSelection);

export const SetSettings = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub = graphistryJS(iframe.current)
        .pipe(
          tap(() =>
            setMessages((arr) => arr.concat([`graphistryJS instantiated; changing settings`]))
          ),
          updateSetting('background', '#ff0000'),
          updateSetting('showToolbar', false),
          tap(() => setMessages((arr) => arr.concat([`Delaying 3s and changing settings again`]))),
          delay(3000),
          updateSetting('background', '#00ff00'),
          updateSetting('showToolbar', true),
          tap(() => setMessages((arr) => arr.concat([`Delaying 3s and changing settings again`]))),
          delay(3000),
          updateSetting('background', '#ff0000'),
          updateSetting('showToolbar', false)
        )
        .subscribe(
          (v) => setMessages((arr) => arr.concat([`pipeline event: ${Object.keys(v).join(', ')}`])),
          (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
          () => setMessages((arr) => arr.concat(['Completed']))
        );
      ////////
      return () => sub.unsubscribe();
    }, [iframe]);

    return (
      <div>
        <h3>Set settings over time:</h3>
        <ol>
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ol>
        <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />
      </div>
    );
  },
};

export const setFilters = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub =
        (graphistryJS(iframe.current)
          .pipe(
            tap(() =>
              setMessages((arr) => arr.concat([`graphistryJS instantiated; pausing 3s...`]))
            ),
            delay(3000),
            tap(() => setMessages((arr) => arr.concat([`adding filters`]))),
            addFilters(
              args.filters || ['point:community_infomap in (4, 5, 6)', 'point:degree > 1']
            ),
            addExclusions(args.exclusions || ['edge:id = 1']),
            togglePanel('filters', false)
          )
          .subscribe(() => null),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])));
      ////////
      return () => (sub.unsubscribe ? sub.unsubscribe() : null);
    }, [iframe]);

    return <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />;
  },
};

export const togglePanelFilters = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub =
        (graphistryJS(iframe.current)
          .pipe(
            tap(() =>
              setMessages((arr) => arr.concat([`graphistryJS instantiated; pausing 3s...`]))
            ),
            delay(3000),
            tap(() => setMessages((arr) => arr.concat([`toggling panel filters`]))),
            togglePanel('filters', true)
          )
          .subscribe(() => null),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])));
      ////////
      return () => (sub.unsubscribe ? sub.unsubscribe() : null);
    }, [iframe]);

    return <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />;
  },
};

export const HideChrome = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub =
        (graphistryJS(iframe.current)
          .pipe(
            tap(() =>
              setMessages((arr) => arr.concat([`graphistryJS instantiated; pausing 3s...`]))
            ),
            delay(3000),
            tap(() => setMessages((arr) => arr.concat([`hiding chrome`]))),
            toggleToolbar(false),
            toggleHistograms(false),
            toggleTimebars(false),
            toggleInspector(false)
          )
          .subscribe(() => null),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])));
      ////////
      return () => (sub.unsubscribe ? sub.unsubscribe() : null);
    }, [iframe]);

    return <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />;
  },
};

export const radialLayoutAndAxis = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub =
        (graphistryJS(iframe.current)
          .pipe(
            tap(() =>
              setMessages((arr) => arr.concat([`graphistryJS instantiated; pausing 3s...`]))
            ),
            tap(() => setMessages((arr) => arr.concat([`radial layout and axis`]))),
            updateSetting('lockedR', true), // any position clustering preserves radius from the center
            updateSetting('background', '#f0f0f0'),
            encodeAxis([
              { r: 40 },
              { internal: true, label: 'my inner label', r: 80 },
              { r: 120 },
              { external: true, label: 'my outer label', r: 160 },
              { r: 200 },
              { r: 220 },
            ])
          )
          .subscribe(() => null),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])));
      ////////
      return () => (sub.unsubscribe ? sub.unsubscribe() : null);
    }, [iframe]);

    return <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />;
  },
};

export const verticalLayoutAndAxis = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      const sub =
        (graphistryJS(iframe.current)
          .pipe(
            tap(() =>
              setMessages((arr) => arr.concat([`graphistryJS instantiated; pausing 3s...`]))
            ),
            //delay(1000),
            tap(() => setMessages((arr) => arr.concat([`radial layout and axis`]))),
            updateSetting('lockedY', true), // any position clustering preserves radius from the center
            updateSetting('background', '#f0f0f0'),
            encodeAxis([
              {
                label: 'bottom category',
                bounds: { min: 'bot min bound', max: 'bot max bound' },
                y: 0,
                width: 100,
              },
              {
                label: 'mid category bottom',
                bounds: { min: 'mid min', max: 'mid max' },
                y: 20,
                width: 200,
              },
              {
                label: 'mid category top',
                //bounds: {min: 'mid top min', max: 'mid top max'},
                y: 40,
                //width: 20
              },
              {
                label: 'top category',
                bounds: { min: 'top min', max: 'top max' },
                y: 60,
                width: 100,
              },
            ])
          )
          .subscribe(() => null),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])));
      ////////
      return () => (sub.unsubscribe ? sub.unsubscribe() : null);
    }, [iframe]);

    return <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />;
  },
};



export const tick = {
  render: (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);
    const [g, setG] = useState(null);
    const [tickCount, setTickCount] = useState(0);

    const milliseconds = 2000;

    useEffect(() => {
      //////// Instantiate GraphistryJS for an iframe
      graphistryJS(iframe.current)
        .pipe(tap((g) => setG(g)))
        .subscribe(
          (g) => setMessages((arr) => arr.concat([`graphistryJS instantiated`, String(g)])),
          (err) => {
            console.error('Error:', err);
            setMessages((arr) => arr.concat([`Error: ${err}`]))
          },
          () => setMessages((arr) => arr.concat(['Completed'])));
    }, [iframe]);

    useEffect(() => {
      if (!g || !tickCount) {
        console.debug('tick not ready', {g, tickCount})
        return;
      }

      of(g)
      .pipe(
        tickClustering(milliseconds)
        //toggleClustering(tickCount % 2 == 1), //or as a toggle

      ).subscribe(
        () => setMessages((arr) => arr.concat([`ticked`])),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])))
    }, [tickCount]);

    return <>
      <button onClick={() => { setTickCount(tickCount + 1); }}>Run {milliseconds/1000}s of ticks</button>    
      <iframe {...defaultIframeProps} ref={iframe} src={lesMisNoPlayNoSplash} {...args} />
    </>;
  },
};

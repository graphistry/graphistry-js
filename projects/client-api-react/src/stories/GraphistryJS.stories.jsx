import React, { useRef, useState, useEffect } from 'react';
import '../../assets/index.css';

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
    toggleInspector,

    encodeAxis,
  
    //rxjs
    tap,
    delay
} from '@graphistry/client-api';
import { addExclusion } from '@graphistry/client-api/src';

const basePath = 'https://hub.graphistry.com';
const lesMisPath = `${basePath}/graph/graph.html?dataset=Miserables`;
const lesMisConfigured = `${lesMisPath}&play=1000`;
const lesMisNoPlayNoSplash = `${lesMisPath}&play=0&splashAfter=false`;

function GraphistryIFrame (args) {
    return <iframe
        src={lesMisConfigured}
        {...args}
    />;
}

export default {
  title: 'Graphistry: Vanilla JS',
  component: GraphistryIFrame
};


const defaultIframeProps = {
    style: {
        width: '100%',
        height: '100%',
        minHeight: '500px',
        border: 'none'
    },
    allowFullScreen: true,
};

//no default args
export const PredefinedDataset = (args) => <iframe
    src={lesMisConfigured}
    {...args}
/>;

export const InstantiateGraphistryJS = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);
    
    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .subscribe(
                    (g) => setMessages(arr => arr.concat([`graphistryJS instantiated: ${Object.keys(g).join(', ')}`])),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        ));
        ////////
        return () => sub.unsubscribe();
    }, [iframe]);
    
    return (
        <div>
        <h3>Instantiate GraphistryJS session for iframe</h3>
        <ol>{ messages.map((m, i) => <li key={i}>{m}</li>) }</ol>
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={`${lesMisPath}&play=0&splashAfter=false`}
            {...args}
        />
        </div>
    );
}

export const SetSettings = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);
    
    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; changing settings`]))),
                    updateSetting('background', '#ff0000'),
                    updateSetting('showToolbar', false),
                    tap(() => setMessages(arr => arr.concat([`Delaying 3s and changing settings again`]))),
                    delay(3000),
                    updateSetting('background', '#00ff00'),
                    updateSetting('showToolbar', true),
                    tap(() => setMessages(arr => arr.concat([`Delaying 3s and changing settings again`]))),
                    delay(3000),
                    updateSetting('background', '#ff0000'),
                    updateSetting('showToolbar', false),
                )
                .subscribe(
                    (v) => setMessages(arr => arr.concat([`pipeline event: ${Object.keys(v).join(', ')}`])),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        ));
        ////////
        return () => sub.unsubscribe();
    }, [iframe]);
    
    return (
        <div>
        <h3>Set settings over time:</h3>
        <ol>{ messages.map((m, i) => <li key={i}>{m}</li>) }</ol>
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
        </div>
    );
};

export const setFilters = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);
    
    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; pausing 3s...`]))),
                    delay(3000),
                    tap(() => setMessages(arr => arr.concat([`adding filters`]))),
                    addFilters(args.filters || ['point:community_infomap in (4, 5, 6)', 'point:degree > 1']),
                    addExclusions(args.exclusions || ['edge:id = 1']),
                    togglePanel('filters', false)
                )
                .subscribe(
                    () => null),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        );
        ////////
        return () => sub.unsubscribe ? sub.unsubscribe() : null;
    }, [iframe]);
    
    return (
        <iframe 
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
    );
};

export const togglePanelFilters = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);
    
    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; pausing 3s...`]))),
                    delay(3000),
                    tap(() => setMessages(arr => arr.concat([`toggling panel filters`]))),
                    togglePanel('filters', true)
                )
                .subscribe(
                    () => null),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        );
        ////////
        return () => sub.unsubscribe ? sub.unsubscribe() : null;
    }, [iframe]);
    
    return (
        <iframe 
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
    );
}

export const HideChrome = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; pausing 3s...`]))),
                    delay(3000),
                    tap(() => setMessages(arr => arr.concat([`hiding chrome`]))),
                    toggleToolbar(false),
                    toggleHistograms(false),
                    toggleTimebars(false),
                    toggleInspector(false)
                )
                .subscribe(
                    () => null),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        );
        ////////
        return () => sub.unsubscribe ? sub.unsubscribe() : null;
    }, [iframe]);

    return (
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
    );
}

export const radialLayoutAndAxis = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; pausing 3s...`]))),
                    tap(() => setMessages(arr => arr.concat([`radial layout and axis`]))),
                    updateSetting('lockedR', true), // any position clustering preserves radius from the center
                    updateSetting('background', '#f0f0f0'),
                    encodeAxis([
                        {r: 40},
                        {internal: true, label: "my inner label", r: 80},
                        {r: 120},
                        {external: true, label: "my outer label", r: 160},
                        {r: 200},
                        {r: 220}
                    ])
                )
                .subscribe(
                    () => null),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        );
        ////////
        return () => sub.unsubscribe ? sub.unsubscribe() : null
    }, [iframe]);

    return (
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
    );
}

export const verticalLayoutAndAxis = (args) => {
    const iframe = useRef(null);
    const [messages, setMessages] = useState(['loading...']);

    useEffect(() => {
        //////// Instantiate GraphistryJS for an iframe
        const sub = (
            graphistryJS(iframe.current)
                .pipe(
                    tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; pausing 3s...`]))),
                    //delay(1000),
                    tap(() => setMessages(arr => arr.concat([`radial layout and axis`]))),
                    updateSetting('lockedY', true), // any position clustering preserves radius from the center
                    updateSetting('background', '#f0f0f0'),
                    encodeAxis([
                        {
                            label: 'bottom category',
                            bounds: {min: 'bot min bound', max: 'bot max bound'},
                            y: 0,
                            width: 100
                        },
                        {
                            label: 'mid category bottom',
                            bounds: {min: 'mid min', max: 'mid max'},
                            y: 20,
                            width: 200
                        },
                        {
                            label: 'mid category top',
                            //bounds: {min: 'mid top min', max: 'mid top max'},
                            y: 40,
                            //width: 20
                        },
                        {
                            label: 'top category',
                            bounds: {min: 'top min', max: 'top max'},
                            y: 60,
                            width: 100
                        },
                        ])
                )
                .subscribe(
                    () => null),
                    (err) => setMessages(arr => arr.concat([`Error: ${err}`])),
                    () => setMessages(arr => arr.concat(['Completed']))
        );
        ////////
        return () => sub.unsubscribe ? sub.unsubscribe() : null
    }, [iframe]);

    return (
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={lesMisNoPlayNoSplash}
            {...args}
        />
    );
}
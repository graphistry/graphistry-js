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
  
    //rxjs
    tap,
    delay
} from '@graphistry/client-api';
import { addExclusion } from '@graphistry/client-api/src';

function GraphistryIFrame (args) {
    return <iframe
        src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=1000"}
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
    src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=1000"}
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
            src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"}
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
            src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"}
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
        return () => sub.unsubscribe();  //FIXME  throws 'sub.unsubscribe() is not a function'
    }, [iframe]);
    
    return (
        <iframe 
            {...defaultIframeProps}
            ref={iframe}
            src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"}
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
        return () => sub.unsubscribe();  //FIXME  throws 'sub.unsubscribe() is not a function'
    }, [iframe]);
    
    return (
        <iframe 
            {...defaultIframeProps}
            ref={iframe}
            src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"}
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
        return () => sub.unsubscribe();  //FIXME  throws 'sub.unsubscribe() is not a function'
    }, [iframe]);

    return (
        <iframe
            {...defaultIframeProps}
            ref={iframe}
            src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"}
            {...args}
        />
    );
}
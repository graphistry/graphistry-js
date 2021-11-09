import React, { useRef, useState, useEffect } from 'react';
import '../../assets/index.css';

import { graphistryJS, updateSetting, tap, delay } from '@graphistry/client-api';

function GraphistryIFrame (args) {
    return <iframe
        src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=1000"}
        {...args}
    />;
}

function GraphistryJS (args) {
    const iframe = useRef(null);
    const [g, setG] = useState(null);
    const [showToolbar, setShowToolbar] = useState(true);

    useEffect(() => {
        console.debug('iframe effect', {iframe, graphistryJS, updateSetting});
        setG(graphistryJS(iframe.current));
    }, [iframe]);

    useEffect(() => {
        if (g) {
            console.debug('toggling showToolbar', {showToolbar, updateSetting, g})
            g.pipe(updateSetting('showToolbar', showToolbar)).subscribe();
        }
    }, [g, showToolbar]);

    return (
        <div>
            <h3>GraphistryJS</h3>
            <div>
                <button onClick={() => setShowToolbar(v => !v)}>
                    {showToolbar ? 'Hide' : 'Show'} toolbar
                </button>
            </div>
            <iframe ref={iframe} src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=1000"} />
        </div>
    );
}

export default {
  title: 'Graphistry: Vanilla JS',
  component: GraphistryIFrame
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
        <iframe ref={iframe} src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"} {...args} />
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
                .pipe(tap(() => setMessages(arr => arr.concat([`graphistryJS instantiated; changing settings`]))))
                .pipe(updateSetting('background', '#ff0000'))
                .pipe(updateSetting('showToolbar', false))
                .pipe(
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
        <iframe ref={iframe} src={"https://hub.graphistry.com/graph/graph.html?dataset=Miserables&play=0&splashAfter=false"} {...args} />
        </div>
    );
};
import React, { useEffect, useState, useRef } from 'react';
import '../../assets/index.css';

import { Graphistry, Client } from '../index';

import {
  //graphistry
  tickClustering,

  //rxjs
  of,

  // Observable
} from '@graphistry/client-api';

export default {
  title: 'Graphistry: React style',
  component: Graphistry,

  // override the default behaviour of passing action-props for every prop that
  // starts with 'on' (see the Storybook config 'preview.js')
  parameters: { actions: { argTypesRegex: null } },
};

export const Empty = {};
export const PredefinedDataset = {
  render: (args) => <Graphistry {...args} dataset="Miserables" showSplashScreen={true} />,
};

const hostname = window.location.hostname;
const useHub = hostname === "github.com" || hostname === "graphistry.github.io";
const graphistryHost = useHub ? 'https://hub.graphistry.com' : `${window.location.protocol}//${window.location.hostname}`;

const defaultSettings = {
  dataset: 'Miserables',
  play: 1,
  showSplashScreen: true,
  graphistryHost
};

export const NoSplashScreen = {
  render: (args) => <Graphistry {...defaultSettings} {...args} showSplashScreen={false} />,
};

export const OnClientAPIConnected = {
  render: (args) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div>
        {loaded ? '...loaded!' : 'not loaded...'}
        <Graphistry
          {...defaultSettings}
          {...args}
          onClientAPIConnected={() => {
            setLoaded(true);
          }}
        />
      </div>
    );
  },
};

export const OnSelectionUpdate = {
  render: (args) => {
    const [selection, setSelection] = useState(undefined);

    const onSelectionUpdate = (err, v) => {
      console.log('onSelectionUpdate', err, v);
      setSelection({ v, err: (err || {}).message });
    };

    return (
      <div>
        {`Selection: ${JSON.stringify(selection)}`}
        <Graphistry {...defaultSettings} {...args} onSelectionUpdate={onSelectionUpdate} />
      </div>
    );
  },
};

export const OnLabelUpdate = {
  render: (args) => {
    const [labels, setLabels] = useState(undefined);

    const onLabelsUpdate = (err, v) => {
      console.log('onLabelsUpdate', err, v);
      setLabels({ v, err });
    };

    return (
      <div>
        {`Labels: ${JSON.stringify(labels)}`}
        <Graphistry {...defaultSettings} {...args} onLabelsUpdate={onLabelsUpdate} />
      </div>
    );
  },
};

export const NoClusteringOnLoad = {
  render: (args) => <Graphistry {...defaultSettings} {...args} play={0} />,
};
export const OneSecondClusteringOnLoad = {
  render: (args) => <Graphistry {...defaultSettings} {...args} play={1} />,
};
export const CustomContainerStyleAndSize = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      {...args}
      containerStyle={{
        width: '100px',
        height: '100px',
        backgroundColor: 'red',
        border: '4px dotted blue',
      }}
      containerClassName=""
      iframeClassName=""
      iframeStyle={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  ),
};

export const BackgroundColor = {
  render: (args) => <Graphistry {...defaultSettings} backgroundColor="#f0f0f0" {...args} />,
};

export const LabelStyle = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      labelOpacity={0.5}
      labelColor="magenta"
      labelBackground="#ffffff"
      {...args}
    />
  ),
};

export const PointStyle = {
  render: (args) => <Graphistry {...defaultSettings} pointSize={10} pointOpacity={0.5} {...args} />,
};

export const EdgeStyle = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      edgeCurvature={0.5}
      edgeOpacity={0.5}
      showArrows={false}
      {...args}
    />
  ),
};

export const NeighborhoodHighlightStyle = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      neighborhoodHighlight={'incoming'}
      neighborhoodHighlightHos={2}
      {...args}
    />
  ),
};

export const HoverPropertiesInsteadOfInspector = {
  render: (args) => <Graphistry {...defaultSettings} showLabelPropertiesOnHover={true} {...args} />,
};

export const LabelsWithoutProperties = {
  render: (args) => <Graphistry {...defaultSettings} showLabelInspector={false} {...args} />,
};

export const LabelsWithoutActions = {
  render: (args) => <Graphistry {...defaultSettings} showLabelActions={false} {...args} />,
};

export const LabelsOnlyOnHover = {
  render: (args) => <Graphistry {...defaultSettings} showPointsOfInterest={false} {...args} />,
};

export const PointsOfInterestWithoutTextLabel = {
  render: (args) => (
    <Graphistry {...defaultSettings} showPointsOfInterestLabels={false} {...args} />
  ),
};

export const ManyPointsOfInterest = {
  render: (args) => <Graphistry {...defaultSettings} pointsOfInterestMax={50} {...args} />,
};

export const HideChrome = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      showToolbar={false}
      showInfo={false}
      showMenu={false}
      showHistograms={false}
      {...args}
    />
  ),
};

export const HideChromeButShowTools = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      showToolbar={false}
      showInfo={false}
      showMenu={false}
      showHistograms={true}
      showInspector={true}
      showLabelInspector={true}
      showLabelActions={true}
      {...args}
    />
  ),
};

export const TogglePanelFilters = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={'filters'} {...args} />,
};

export const TogglePanelExclusions = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={'exclusions'} {...args} />,
};

export const TogglePanelScene = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={'scene'} {...args} />,
};

export const TogglePanelLabels = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={'labels'} {...args} />,
};

export const TogglePanelLayout = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={'layout'} {...args} />,
};

export const TogglePanelNone = {
  render: (args) => <Graphistry {...defaultSettings} togglePanel={false} {...args} />,
};

export const ScalePointSize = {
  render: (args) => (
    <Graphistry {...defaultSettings} encodePointSize={'betweenness'} pointSize={0.2} {...args} />
  ),
};

export const BindPointSizeCategorical = {
  render: (args) => {
    //Load sizes 3s after client connected (workaround timing bug)
    const [sizes, setSizes] = useState();

    return (
      <Graphistry
        {...defaultSettings}
        dataset={'6fbdc5fb9ca64f37ade8a7a5ccb337f0'}
        {...args}
        onClientAPIConnected={() => {
          setTimeout(() => {
            console.debug('Setting sizes 3s after client connected');
            setSizes(
              args.encodePointSize || [
                'tag_wearamask',
                {
                  encodingType: 'size',
                  graphType: 'point',
                  attribute: 'tag_wearamask',
                  mapping: {
                    categorical: {
                      fixed: {
                        0: 1,
                        1: 1,
                        2: 10,
                        3: 1,
                        4: 1,
                      },
                      other: 1,
                    },
                  },
                },
              ]
            );
          }, 3000);
        }}
        encodePointSize={sizes}
        pointSize={0.5}
      />
    );
  },
};

export const BindPointColorContinuous = {
  render: (args) => {
    //Load colors 3s after client connected (workaround timing bug)
    const [colors, setColors] = useState();

    return (
      <Graphistry
        {...defaultSettings}
        dataset={'6fbdc5fb9ca64f37ade8a7a5ccb337f0'}
        {...args}
        onClientAPIConnected={() => {
          setTimeout(() => {
            console.debug('Setting colors 3s after client connected');
            setColors(
              args.encodePointColor || ['degree', 'continuous', ['#00f', '#f00', 'yellow']]
            );
          }, 3000);
        }}
        encodePointColor={colors}
      />
    );
  },
};

export const LayoutSettings = {
  render: (args) => (
    <Graphistry
      {...defaultSettings}
      precisionVsSpeed={0.5}
      gravity={0.5}
      scalingRatio={0.5}
      edgeInfluence={0.5}
      strongGravity={true}
      dissuadeHubs={true}
      linLog={true}
      {...args}
    />
  ),
};

export const LayoutLockedX = {
  render: (args) => <Graphistry {...defaultSettings} lockedX={true} {...args} />,
};

export const LayoutLockedY = {
  render: (args) => <Graphistry {...defaultSettings} lockedY={true} {...args} />,
};

export const LayoutLockedRadius = {
  render: (args) => <Graphistry {...defaultSettings} lockedR={true} {...args} />,
};

export const RadialAxisAndLayout = {
  render: () => (
    <Graphistry
      {...defaultSettings}
      lockedR={true}
      backgroundColor="#f0f0f0"
      axes={[
        { r: 40 },
        { internal: true, label: 'my inner label', r: 80 },
        { r: 120 },
        { external: true, label: 'my outer label', r: 160 },
        { r: 200 },
        { r: 220 },
      ]}
    />
  ),
};

export const VerticalAxisAndLayout = {
  render: () => (
    <Graphistry
      {...defaultSettings}
      lockedY={true}
      backgroundColor="#f0f0f0"
      axes={[
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
      ]}
    />
  ),
};
export const Filters = {
  render: (args) => {
    //Load filters 1s after client connected (workaround timing bug)
    const [filters, setFilters] = useState();
    const [exclusions, setExclusions] = useState();
    const [panel, setPanel] = useState();
    const [messages, setMessages] = useState(['Start viz to begin...']);
   
    return (
      <>
      <button onClick={() => { 
        setFilters(['point:community_infomap in (4, 5, 6)', 'point:degree > 1']);
        setPanel(['filters', false]);
        setMessages((arr) => arr.concat([`Added filters`]));
       }}>add 2 filters</button>
      <button onClick={() => { 
        setExclusions(['edge:_title = 1']);
        setPanel(['exclusions', false]);
        setMessages((arr) => arr.concat([`Added exclusions`]));
       }}>add 1 exclusion</button>
        <Graphistry
          {...defaultSettings}
          pruneOrphans={true}
          {...args}
        setTogglePanel={panel}
        exclusions={exclusions}
        filters={filters}
      />
        <pre>{messages.join('\n')}</pre>
      </>
    );
  },
};

export const Ticks = {
  render: (args) => {

    const milliseconds = 2000;

    const [messages, setMessages] = useState(['Start viz to begin...']);
    const [tickCount, setTickCount] = useState(0);
    const [g, setG] = useState();

    useEffect(() => {
      if (!g) { return; }
      if (!tickCount) {
        setMessages((arr) => arr.concat([`Click button to toggle ${milliseconds/1000}s of clustering...`]));
        return;
      }
      setMessages((arr) => arr.concat([`Running ${milliseconds/1000}s of ticks`]));
    }, [g, tickCount]);

    useEffect(() => {
      if (!g || !tickCount) { return; }
      of(g)
      .pipe(
        tickClustering(milliseconds)
        //toggleClustering(tickCount % 2 == 1), //or as a toggle
      ).subscribe(
        () => setMessages((arr) => arr.concat([`ticked`])),
        (err) => setMessages((arr) => arr.concat([`Error: ${err}`])),
        () => setMessages((arr) => arr.concat(['Completed'])))

    }, [g, tickCount]);

    return (<>
      <button onClick={() => { setTickCount(tickCount + 1); }}>Run {milliseconds/1000}s of ticks</button>    
      <Graphistry
        {...defaultSettings}
        {...args}
        play={0}
        onClientAPIConnected={(g) => {
          console.debug('@Tick api connected', {g});
          setG(g);
        }}
      />
      <pre>{messages.join('\n')}</pre>
    </>);
  },
};

// test for auth, can remove later
export const ClientVerificationTest = () => {
  const graphistryRef = useRef();
  const [verificationLog, setVerificationLog] = useState([]);
  const [client, setClient] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setVerificationLog(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${message}`]);
    console.log(`[AUTH TEST] ${message}`);
  };

  const createTestClient = async () => {
    if (!username || !password) {
      addLog('❌ Need username/password to create client', 'error');
      return;
    }

    try {
      setIsConnecting(true);
      addLog('Creating Client instance...', 'info');

      const testClient = new Client(username, password, org, 'https', 'hub.graphistry.com');
      addLog('✅ Client instance created', 'success');

      addLog('Waiting for authentication...', 'info');
      await testClient._getAuthTokenPromise;

      addLog('✅ Client authenticated successfully', 'success');
      addLog(`Token received: ${testClient._token.substring(0, 20)}...`, 'info');
      setClient(testClient);

    } catch (err) {
      addLog(`❌ Client creation failed: ${err.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px' }}>
      {/* control */}
      <div style={{ width: '350px', padding: '10px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        <h3>JWT Auth Test</h3>

        {/* auth */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <h4 style={{ marginTop: 0 }}>Create Client</h4>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: '5px', padding: '5px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '5px', padding: '5px', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            placeholder="Org (optional)"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            style={{ width: '100%', marginBottom: '10px', padding: '5px', boxSizing: 'border-box' }}
          />
          <button
            onClick={createTestClient}
            disabled={isConnecting || !username || !password}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: client ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: (isConnecting || !username || !password) ? 'not-allowed' : 'pointer'
            }}
          >
            {isConnecting ? 'Authenticating...' : client ? '✅ Authenticated' : 'Authenticate'}
          </button>
        </div>

        {/* log */}
        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '5px', borderBottom: '1px solid #e9ecef', backgroundColor: '#e9ecef', fontWeight: 'bold', fontSize: '12px' }}>
            Auth Log
            <button
              onClick={() => setVerificationLog([])}
              style={{ float: 'right', fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
          <div style={{ padding: '5px', fontSize: '10px', fontFamily: 'monospace', flex: 1, overflowY: 'auto' }}>
            {verificationLog.length === 0 ? (
              <div style={{ color: '#666' }}>Enter credentials and click "Authenticate"</div>
            ) : (
              verificationLog.map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '2px',
                    color: log.includes('SUCCESS') ? '#155724' : log.includes('ERROR') ? '#721c24' : log.includes('WARNING') ? '#856404' : '#495057'
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* viz */}
      <div style={{ flex: 1 }}>
        <Graphistry
          ref={graphistryRef}
          client={client}
          dataset="Miserables"
          graphistryHost="https://hub.graphistry.com"
          onClientAPIConnected={(g) => {
            addLog('🔗 Graphistry iframe connected', 'success');

            // check if token was stored
            const storedToken = localStorage.getItem('graphistry_auth_token');
            if (storedToken) {
              addLog('✅ JWT token stored in localStorage', 'success');
              addLog('✅ Token sent to iframe via postMessage', 'success');
            } else {
              addLog('⚠️  No JWT token in localStorage', 'warning');
            }
          }}
        />
      </div>
    </div>
  );
};


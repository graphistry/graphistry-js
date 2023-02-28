import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from 'react-markdown'

const NODE_LABELS = {
    0: "Myriel", 1: "Napoleon", 2: "Mlle Baptistine", 3: "Mme Magloire", 4: "Countess DeLo", 5: "Geborand", 
    6: "Champtercier", 7: "Cravatte", 8: "Count", 9: "OldMan", 10: "Labarre", 11: "Valjean", 12: "Marguerite", 
    13: "Mme DeR", 14: "Isabeau", 15: "Gervais", 16: "Tholomyes", 17: "Listolier", 18: "Fameuil", 19: "Blacheville", 
    20: "Favourite", 21: "Dahlia", 22: "Zephine", 23: "Fantine", 24: "Mme Thenardier", 25: "Thenardier", 26: "Cosette", 
    27: "Javert", 28: "Fauchelevent", 29: "Bamatabois", 30: "Perpetue", 31: "Simplice", 32: "Scaufflaire", 
    33: "Woman1", 34: "Judge", 35: "Champmathieu", 36: "Brevet", 37: "Chenildieu", 38: "Cochepaille", 
    39: "Pontmercy", 40: "Boulatruelle", 41: "Eponine", 42: "Anzelma", 43: "Woman2", 44: "Mother Innocent", 
    45: "Gribier", 46: "Jondrette", 47: "Mme Burgon", 48: "Gavroche", 49: "Gillenormand", 50: "Magnon", 
    51: "Mlle Gillenormand", 52: "Mme Pontmercy", 53: "Mlle Vaubois", 54: "Lt Gillenormand", 55: "Marius", 
    56: "BaronessT", 57: "Mabeuf", 58: "Enjolras", 59: "Combeferre", 60: "Prouvaire", 61: "Feuilly", 
    62: "Courfeyrac", 63: "Bahorel", 64: "Bossuet", 65: "Joly", 66: "Grantaire", 67: "Mother Plutarch", 
    68: "Gueulemer", 69: "Babet", 70: "Claquesous", 71: "Montparnasse", 72: "Toussaint", 73: "Child1", 
    74: "Child2", 75: "Brujon", 76: "Mme Hucheloup"
};


const PREFIX = `Major themes and narritive structure of Les Miserables
`;


const CONTEXTS = {
  relationship: "The relationships of $?",
  scene: "Scenewise analysis of $?",
}

const formatList = a => a.length ? a.reduce((a, b, i, array) => a + (i < array.length - 1 ? ', ' : ' and ') + b) : '';

const ChatIcon = ({c, ...rest}) => (
  <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fill={c} d="M22.375 9H9.625C8.45293 9 7.5 9.78477 7.5 10.75V18.625C7.5 19.5902 8.45293 20.375 9.625 20.375H12.8125V22.6719C12.8125 22.9398 13.1844 23.0957 13.4467 22.9371L17.5938 20.375H22.375C23.5471 20.375 24.5 19.5902 24.5 18.625V10.75C24.5 9.78477 23.5471 9 22.375 9Z" />
  </svg>
)

const UpdateIcon = ({c, ...rest}) => (
  <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fill={c} d="M16.8339 16.6145L24.0058 22.4582C24.5015 22.8621 24.5015 23.5152 24.0058 23.9148L22.814 24.8859C22.3183 25.2899 21.5167 25.2899 21.0263 24.8859L15.9374 20.7481L10.8539 24.8902C10.3582 25.2941 9.55659 25.2941 9.06616 24.8902L7.86909 23.9191C7.37339 23.5152 7.37339 22.8621 7.86909 22.4625L15.041 16.6188C15.5367 16.2106 16.3382 16.2105 16.8339 16.6145V16.6145ZM15.041 8.36445L7.86909 14.2082C7.37339 14.6121 7.37339 15.2652 7.86909 15.6648L9.06089 16.6359C9.55659 17.0398 10.3582 17.0398 10.8486 16.6359L15.9322 12.4938L21.0158 16.6359C21.5115 17.0398 22.313 17.0398 22.8035 16.6359L23.9952 15.6648C24.491 15.2609 24.491 14.6078 23.9952 14.2082L16.8234 8.36445C16.3382 7.96055 15.5367 7.96055 15.041 8.36445Z"/>
  </svg>
)

const SubmitIcon = ({c, ...rest}) => (
  <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fill={c} d="M3.43816 19.4709L12.7196 26.0015C13.5321 26.5732 14.8125 26.1091 14.8125 25.221V21.7813C23.2832 21.7022 30 20.3189 30 13.778C30 11.1379 27.9127 8.52252 25.6055 7.15512C24.8855 6.7284 23.8594 7.26396 24.1249 7.95568C26.516 14.1867 22.9907 15.8409 14.8125 15.9368V12.1592C14.8125 11.2697 13.531 10.8077 12.7196 11.3787L3.43816 17.9099C2.85434 18.3208 2.85355 19.0595 3.43816 19.4709V19.4709Z" />
  </svg>
)


const Select = ({ options, value, onChange, className }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={className + " select"}>
        {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
        ))}
    </select>
)

const QueryInput = ({ query, onChange, onEditingChange }) => (
    <textarea
      rows="4"
      type="text"
      value={query}
      onChange={e => onChange(e.target.value)}
      onFocus={() => onEditingChange(true)}
      onBlur={() => onEditingChange(false)}
      className="query-input" />
);

const KeyInput = ({ value, onChange }) => {
  const [open, setOpen] = useState(value.length < 10);

  return (
    <div className="key-input-container">
      <div className={value.length < 10 ?  "key-input-label alert" : "key-input-label"} onClick={() => setOpen(!open)}>OpenAI Key</div>
      {open && (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="key-input" />
      )}
    </div>
)};

const SidebarSelection = ({ selection }) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(Object.values(CONTEXTS)[0]);
  // const debouncedQuery = useDebounce(query, 800);
  const debouncedSelection = useDebounce(selection, 200); // Only get the first 10 nodes
  const [context, setContext] = useState(Object.keys(CONTEXTS)[0]);
  const [openaiKey, setOpenaiKey] = useState("");
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const names = formatList((debouncedSelection?.point?.map(id => NODE_LABELS[id]) ?? []).filter(v => v).slice(0, 4));
  const filledQuery = query.replace('$', names);

  console.log('CRA', openaiKey);

  const submit = async () => {

    const url =  "https://api.openai.com/v1/completions";

    // If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"Unknown\".\n

    const params = {
      "model": "text-davinci-003",
      "prompt": `${PREFIX} ${filledQuery}`,
      "temperature": 0.2,
      "max_tokens": 350,
      "top_p": 1,
      "frequency_penalty": 0,
      "presence_penalty": 0,
      // "stop": ["\n"]
    };
  
    console.log('CRA', 'Making fetch to ', url, params);
    setLoading(true);
    try {
      const data = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await data.json();
      console.log('CRA', 'Got response', json, data);
      setResult(json.choices[0].text);
      setLoading(false);
    } catch (err) {
        setResult("err");
        console.error(err);
        setLoading(false);
    }
  }

  const queryText = editing ? query : filledQuery;
  return (
    <div className={open ? "sb" : "sb-closed"}>
        <div className="sb-body">
            <div className="sb-form">
                <QueryInput query={queryText} onChange={setQuery} onEditingChange={setEditing} />
                <div className="sb-submit-bar">
                  <div className="sb-label">preset:</div>
                  <UpdateIcon className="sb-icon-button" onClick={() => setQuery(CONTEXTS[context])} />
                  <Select onChange={setContext} value={context} options={Object.keys(CONTEXTS)} className="right" />
                  <div className="sb-flex-grow" />
                  <SubmitIcon className="sb-icon-button" onClick={submit}/>
                </div>
            </div>
            <ReactMarkdown className="sb-result">{loading ? "Loading..." : result }</ReactMarkdown>
            <div className="sb-footer">
              <KeyInput value={openaiKey} onChange={setOpenaiKey} />
              {debouncedSelection?.point?.length ? JSON.stringify(debouncedSelection?.point) : ''}
            </div>
        </div>
        <div className="sb-toggle sb-icon-button" onClick={() => setOpen(!open)}><ChatIcon /></div>
    </div>
  );
};

function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler);
        };
      },
      [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
}
  

export default SidebarSelection;

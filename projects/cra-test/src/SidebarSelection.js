import { useState, useEffect } from "react";
import "./App.css";

const NODE_LABELS = {
    0: "Myriel", 1: "Napoleon", 2: "MlleBaptistine", 3: "MmeMagloire", 4: "CountessDeLo", 5: "Geborand", 
    6: "Champtercier", 7: "Cravatte", 8: "Count", 9: "OldMan", 10: "Labarre", 11: "Valjean", 12: "Marguerite", 
    13: "MmeDeR", 14: "Isabeau", 15: "Gervais", 16: "Tholomyes", 17: "Listolier", 18: "Fameuil", 19: "Blacheville", 
    20: "Favourite", 21: "Dahlia", 22: "Zephine", 23: "Fantine", 24: "MmeThenardier", 25: "Thenardier", 26: "Cosette", 
    27: "Javert", 28: "Fauchelevent", 29: "Bamatabois", 30: "Perpetue", 31: "Simplice", 32: "Scaufflaire", 
    33: "Woman1", 34: "Judge", 35: "Champmathieu", 36: "Brevet", 37: "Chenildieu", 38: "Cochepaille", 
    39: "Pontmercy", 40: "Boulatruelle", 41: "Eponine", 42: "Anzelma", 43: "Woman2", 44: "MotherInnocent", 
    45: "Gribier", 46: "Jondrette", 47: "MmeBurgon", 48: "Gavroche", 49: "Gillenormand", 50: "Magnon", 
    51: "MlleGillenormand", 52: "MmePontmercy", 53: "MlleVaubois", 54: "LtGillenormand", 55: "Marius", 
    56: "BaronessT", 57: "Mabeuf", 58: "Enjolras", 59: "Combeferre", 60: "Prouvaire", 61: "Feuilly", 
    62: "Courfeyrac", 63: "Bahorel", 64: "Bossuet", 65: "Joly", 66: "Grantaire", 67: "MotherPlutarch", 
    68: "Gueulemer", 69: "Babet", 70: "Claquesous", 71: "Montparnasse", 72: "Toussaint", 73: "Child1", 
    74: "Child2", 75: "Brujon", 76: "MmeHucheloup"
};


const CONTEXT_OPTIONS = ["summary", "compare", "explain"];

const ChatIcon = ({c}) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill={c} xmlns="http://www.w3.org/2000/svg">
        <path d="M22.375 9H9.625C8.45293 9 7.5 9.78477 7.5 10.75V18.625C7.5 19.5902 8.45293 20.375 9.625 20.375H12.8125V22.6719C12.8125 22.9398 13.1844 23.0957 13.4467 22.9371L17.5938 20.375H22.375C23.5471 20.375 24.5 19.5902 24.5 18.625V10.75C24.5 9.78477 23.5471 9 22.375 9Z" />
    </svg>
)

const Select = ({ options, value, onChange, className }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={className + " select"}>
        {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
        ))}
    </select>
)

const QueryInput = ({ query, onChange }) => (
    <input type="text" value={query} onChange={e => onChange(e.target.value)} className="query-input" />
);

const SidebarSelection = ({ selection }) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("What country is relevant to these?");
  const debouncedQuery = useDebounce(query, 800);
  const debouncedSelection = useDebounce(selection, 200); // Only get the first 10 nodes
  const [context, setContext] = useState(CONTEXT_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        if (!debouncedSelection?.point?.length > 0) {
            setResult("");
            return;
        }

        setLoading(true);

        const onlyTen = debouncedSelection.point.slice(0, 10);
        const url = 'https://837a-23-93-73-49.ngrok.io/parse?' + new URLSearchParams({ context: 'summary', query: debouncedQuery, nodeIDs: onlyTen })
        //const url = 'https://837a-23-93-73-49.ngrok.io/parse?query=what%20are%20professional%20titles%20found%20in%20corpus%3F&context=summary&nodeIDs=1%2C2%2C3%2C4%2C%2010%2C%2020'
        console.log('CRA', 'Making fetch to ', url);

        fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(data => {
            console.log(data, data.json(), 'CRA')
            setResult(JSON.stringify(data.json()));
            setLoading(false);
        }).catch(err => {
            setResult("err");
            console.error(err);
            setLoading(false);
        })
    }

    fetchData().catch(console.error);
  }, [debouncedQuery, debouncedSelection, context]);

//   const innerQuery = selection
//     ? selection.point.map((v) => NODE_LABELS[v]).join("+")
//     : "";
//   const query = innerQuery ? `https://you.com/search?q=How+are+the+les+mis+characters+${innerQuery}+related?&tbm=youchat&cfr=chat` : 'https://you.com';

  return (
    <div className={open ? "sb" : "sb-closed"}>
        <div className="sb-body">
            <div className="sb-form">
                <Select onChange={setContext} value={context} options={CONTEXT_OPTIONS} className="right" />
                <QueryInput query={query} onChange={setQuery} />
            </div>
            <div className="sb-result">
                {loading ? "Loading..." : result }
            </div>
            <div className="sb-footer">First 10 of {debouncedSelection?.point?.length ? JSON.stringify(debouncedSelection?.point) : ''}</div>
        </div>
        <div className="sb-toggle" onClick={() => setOpen(!open)}>
            <ChatIcon c="#555" />
        </div>
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

import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from 'react-markdown'

const ID_MAP = {
    0: "Lexinfintech Holdings Ltd.",
    2: "Sega Sammy Holdings, Inc.",
    3: "MEDIASEEK, Inc.",
    8: "Nippon Telegraph & Telephone Corp.",
    10: "ChinaCache International Holdings Ltd.",
    11: "Autohome, Inc.",
    12: "Renesas Electronics Corp.",
    13: "NTT DoCoMo, Inc.",
    14: "MEDIA DO HOLDINGS Co., Ltd.",
    15: "Phoenix New Media Ltd.",
    16: "E-Commerce China Dangdang, Inc.",
    17: "Danal Co., Ltd.",
    19: "Kakao Corp.",
    1: "JD.com, Inc.",
    21: "Shenzhen Infogem Technologies Co., Ltd.",
    22: "Beijing Sankuai Technology Co., Ltd.",
    23: "JMU Ltd.",
    24: "Beijing Jingkelong Co. Ltd.",
    25: "Shenyang Cuihua Gold & Silver Jewelry Co., Ltd.",
    26: "Capcom Co., Ltd.",
    29: "Soliton Systems KK",
    30: "Sankyo Co., Ltd.",
    31: "Fields Corp.",
    32: "NetEase, Inc.",
    33: "China Central Television",
    34: "Guangzhou Baiyunshan Pharmaceutical Holdings Co. Ltd.",
    35: "Harbin Bank Co., Ltd.",
    36: "Innotech Corp.",
    38: "Carpenter Tan Holdings Ltd.",
    40: "21Vianet Group, Inc.",
    42: "Bitauto Holdings Ltd.",
    43: "Shineco, Inc.",
    45: "Jumei International Holding Ltd.",
    46: "Futong Technology Development Holdings Ltd.",
    47: "Sohu.com, Inc.",
    48: "Chinasoft International Ltd.",
    49: "CALBEE, Inc.",
    5: "Bolina Holding Co. Ltd.",
    51: "Jiangxi Lianchuang Optoelectronic Science & Tech Co., Ltd.",
    52: "Weibo Corp.",
    53: "Axel Mark, Inc.",
    54: "China Minsheng Banking Corp., Ltd.",
    56: "Shanghai Pudong Development Bank Co., Ltd.",
    57: "Baidu, Inc.",
    59: "ANTA Sports Products Ltd.",
    60: "MIRAIT Holdings Corp.",
    61: "China Logistics Property Holdings Co., Ltd.",
    62: "Qunar Cayman Islands Ltd.",
    63: "Renren Inc.",
    66: "PixArt Imaging, Inc.",
    67: "Tuniu Corp.",
    68: "Hangzhou Shuyun Information Technology Co., Ltd.",
    6: "Alibaba Group Holding Ltd.",
    70: "Toshin Corp.",
    71: "Yonghui Superstores Co., Ltd.",
    72: "Kyoraku Sangyo Holdings KK",
    73: "Baozun, Inc.",
    74: "Shogakukan, Inc.",
    7: "Wangsu Science & Technology Co., Ltd.",
    75: "Kingold Jewelry, Inc.",
    76: "Infocom Corp.",
    77: "Kitazawa Sangyo Co., Ltd.",
    78: "Momo, Inc.",
    79: "CONEXIO Corp.",
    80: "Fiyta Holdings Ltd.",
    81: "Sogo Media, Inc.",
    83: "Dimerco Express Corp.",
    84: "Tantech Holdings Ltd.",
    86: "China Literature Ltd.",
    87: "Kingworld Medicines Group Ltd.",
    88: "Leju Holdings Ltd.",
    90: "Bank of China Ltd.",
    91: "Beijing Cainiao Network Technology Co. Ltd.",
    93: "CN",
    55: "Ourpalm Co., Ltd.",
  };
  

const CONTEXT_OPTIONS = ["summary", "entities", "relationships", "money", "time", "threats"];

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
  const [query, setQuery] = useState("How do these relate. Give the response in Markdown.");
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

        
        const titles = debouncedSelection.point.map(id => ID_MAP[id]).filter(v => v).slice(0, 10);
        // const titles = ["CN", "Baidu, Inc.", "Kakao Corp."]
        const args = JSON.stringify({ context: 'summary', query: debouncedQuery, titles })
        const url = 'http://837a-23-93-73-49.ngrok.io/parse?v=' + encodeURIComponent(args)
        //const url = 'https://837a-23-93-73-49.ngrok.io/parse?query=what%20are%20professional%20titles%20found%20in%20corpus%3F&context=summary&nodeIDs=1%2C2%2C3%2C4%2C%2010%2C%2020'
        console.log('CRA', 'Making fetch to ', url);

        try {
            const data = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const json = await data.json();

            console.log('CRA', 'Got response', json);
            setResult(json.value);
            setLoading(false);
        } catch (err) {
            setResult("err");
            console.error(err);
            setLoading(false);
        }
    }

    fetchData().catch(console.error);
  }, [debouncedQuery, debouncedSelection, context]);

  return (
    <div className={open ? "sb" : "sb-closed"}>
        <div className="sb-body">
            <div className="sb-form">
                <Select onChange={setContext} value={context} options={CONTEXT_OPTIONS} className="right" />
                <QueryInput query={query} onChange={setQuery} />
            </div>
            <ReactMarkdown className="sb-result">{loading ? "Loading..." : result }</ReactMarkdown>
            <div className="sb-footer">{debouncedSelection?.point?.length ? JSON.stringify(debouncedSelection?.point) : ''}</div>
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

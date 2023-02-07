import { useState } from "react";
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

const SidebarSelection = ({ selection }) => {
  const [open, setOpen] = useState(true);

  const innerQuery = selection
    ? selection.point.map((v) => NODE_LABELS[v]).join("+")
    : "";

  const query = innerQuery ? `https://you.com/search?q=How+are+the+les+mis+characters+${query}+related?&tbm=youchat&cfr=chat` : 'https://you.com';

  return (
    <div className={open ? "sb" : "sb-closed"}>
        <iframe className="sb-body" src={query} title="you.com query"/>
        <div className="sb-toggle" onClick={() => setOpen(!open)}>
            <svg width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.848 10.327c-.373-1.835-1.687-2.86-2.698-3.106-2.673-.647-4.164 1.663-6.205 1.87-2.364.235-5.317-.148-7.142.799-1.217.633-2.232 2.07-1.619 4.479 1.08 4.243 6.097 6.862 11.444 5.312 4.425-1.285 7.06-5.175 6.215-9.354h.005ZM8.495 13.75a.893.893 0 0 1-1.05-.697.893.893 0 0 1 .697-1.05.893.893 0 0 1 1.05.697.893.893 0 0 1-.697 1.05Zm6.598 4.086a4.044 4.044 0 0 1-4.71-2.934c-.034-.122.05-.245.177-.274l.76-.152a.222.222 0 0 1 .26.156 2.817 2.817 0 0 0 3.268 2.007 2.816 2.816 0 0 0 2.236-3.115.225.225 0 0 1 .182-.245l.76-.152a.23.23 0 0 1 .27.181 4.041 4.041 0 0 1-3.198 4.533l-.005-.005Zm4.297-6.289a.893.893 0 0 1-1.05-.697.893.893 0 0 1 .697-1.05.893.893 0 0 1 1.05.697.893.893 0 0 1-.697 1.05Z" fill="#696B6C"></path></svg>
        </div>
    </div>
  );
};

export default SidebarSelection;

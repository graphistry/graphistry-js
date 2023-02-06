import React from "react";
import "./App.css";

const NODE_LABELS = {0: "Myriel", 1: "Napoleon", 2: "MlleBaptistine", 3: "MmeMagloire", 4: "CountessDeLo", 5: "Geborand", 
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
74: "Child2", 75: "Brujon", 76: "MmeHucheloup"}




const SidebarSelection = ({show, style, selection}) => {
    if (!show) {
        return null;
}


const query =  selection ? selection.point.map( (v) => NODE_LABELS[v] ).join(' ') : '';

    return (
        <div className="SidebarSelection">
        <div className="SidebarBox" style={style}>
            <h1>
            <div class="dropdown">
                <button class="dropbtn">onSelection demo!</button>
            </div>
                <hr />
            </h1>
            <div className="sb-body">
                <iframe  className="sb-body" src={`https://you.com/search?q=How+are+the+les+mis+characters+${query}+related?&tbm=youchat&cfr=chat`} title="testing" />
            </div>
        </div>
        </div>
    );
    }

export default SidebarSelection;
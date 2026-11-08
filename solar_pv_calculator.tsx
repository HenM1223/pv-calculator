import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sun, 
  Zap, 
  Settings2, 
  Layers, 
  Plus, 
  Trash2, 
  Server,
  Activity,
  ArrowDownToLine,
  ArrowUpToLine,
  Info
} from 'lucide-react';

export default function SolarCalculator() {
  // --- State ---
  const [panelPower, setPanelPower] = useState(650);
  const [targetRatio, setTargetRatio] = useState(1.05);
  const [mvsPower, setMvsPower] = useState(6400);

  const [configs, setConfigs] = useState([
    { id: 1, type: '2P', stringsPerTable: 4, panelsPerString: 27, quantity: 513 },
    { id: 2, type: '2P', stringsPerTable: 2, panelsPerString: 27, quantity: 62 }
  ]);

  // --- Handlers ---
  const addConfig = () => {
    const newId = configs.length > 0 ? Math.max(...configs.map(c => c.id)) + 1 : 1;
    setConfigs([...configs, { id: newId, type: '1P', stringsPerTable: 2, panelsPerString: 28, quantity: 10 }]);
  };

  const removeConfig = (id) => {
    setConfigs(configs.filter(c => c.id !== id));
  };

  const updateConfig = (id, field, value) => {
    setConfigs(configs.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  // --- Calculations ---
  const results = useMemo(() => {
    let totalPanels = 0;
    let totalStrings = 0;

    configs.forEach(conf => {
      const q = Number(conf.quantity) || 0;
      const str = Number(conf.stringsPerTable) || 0;
      const pan = Number(conf.panelsPerString) || 0;
      
      totalStrings += q * str;
      totalPanels += q * str * pan;
    });

    const pPanel = Number(panelPower) || 0;
    const tRatio = Number(targetRatio) || 1;
    const mvs = Number(mvsPower) || 1;

    const totalDcPower_W = totalPanels * pPanel;
    const totalDcPower_kWp = totalDcPower_W / 1000;
    const totalDcPower_MWp = totalDcPower_kWp / 1000;

    const requiredAcPower_kVA = tRatio > 0 ? totalDcPower_kWp / tRatio : 0;
    const requiredAcPower_MVA = requiredAcPower_kVA / 1000;

    const exactMvsCount = mvs > 0 ? requiredAcPower_kVA / mvs : 0;

    // Alternative A: Round Up
    const mvsCountA = Math.ceil(exactMvsCount);
    const totalAcA = mvsCountA * mvs;
    const ratioA = totalAcA > 0 ? totalDcPower_kWp / totalAcA : 0;

    // Alternative B: Round Down
    const mvsCountB = Math.floor(exactMvsCount);
    const totalAcB = mvsCountB * mvs;
    const ratioB = totalAcB > 0 ? totalDcPower_kWp / totalAcB : 0;

    return {
      totalPanels,
      totalStrings,
      totalDcPower_kWp,
      totalDcPower_MWp,
      requiredAcPower_kVA,
      requiredAcPower_MVA,
      exactMvsCount,
      altA: { count: mvsCountA, ac: totalAcA, ratio: ratioA },
      altB: { count: mvsCountB, ac: totalAcB, ratio: ratioB }
    };
  }, [configs, panelPower, targetRatio, mvsPower]);

  // --- Helpers ---
  const formatNum = (num, decimals = 2) => {
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calculator className="text-emerald-600" size={32} />
            Agro-PV / PV Plant Calculator
          </h1>
          <p className="text-slate-500 mt-1">מחשבון הנדסי לתכנון שדות סולאריים ותחנות השנאה (MVS)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN - INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Global Parameters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100/50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
              <Settings2 className="text-slate-500" size={20} />
              <h2 className="font-semibold text-lg">הגדרות מתקן כלליות</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">הספק פאנל בודד (W)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={panelPower}
                    onChange={(e) => setPanelPower(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                  <Sun className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">יחס העמסה מבוקש (AC/DC)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={targetRatio}
                    onChange={(e) => setTargetRatio(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                  <Activity className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">הספק תחנת השנאה MVS (kVA)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={mvsPower}
                    onChange={(e) => setMvsPower(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                  <Server className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Configurations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100/50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="text-slate-500" size={20} />
                <h2 className="font-semibold text-lg">תצורת שולחנות (Trackers/Fixed)</h2>
              </div>
              <button 
                onClick={addConfig}
                className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} /> הוסף סוג
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {configs.length === 0 && (
                <p className="text-center text-slate-500 py-4">לא הוגדרו שולחנות. לחץ על 'הוסף סוג'.</p>
              )}
              {configs.map((conf, index) => (
                <div key={conf.id} className="relative p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-wrap gap-4 items-end">
                  <div className="absolute top-2 left-2">
                    <button 
                      onClick={() => removeConfig(conf.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="מחק שורה"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="w-full mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">סוג #{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-slate-600 mb-1">סוג מבנה</label>
                    <select 
                      value={conf.type}
                      onChange={(e) => updateConfig(conf.id, 'type', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="1P">1P</option>
                      <option value="2P">2P</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-slate-600 mb-1">סטרינגים לשולחן</label>
                    <input 
                      type="number" min="1"
                      value={conf.stringsPerTable}
                      onChange={(e) => updateConfig(conf.id, 'stringsPerTable', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-slate-600 mb-1">פאנלים בסטרינג</label>
                    <input 
                      type="number" min="1"
                      value={conf.panelsPerString}
                      onChange={(e) => updateConfig(conf.id, 'panelsPerString', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-slate-600 mb-1">כמות שולחנות</label>
                    <input 
                      type="number" min="0"
                      value={conf.quantity}
                      onChange={(e) => updateConfig(conf.id, 'quantity', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 font-semibold text-emerald-700 bg-emerald-50/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEFT COLUMN - RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">סה"כ פאנלים</p>
              <p className="text-2xl font-bold text-slate-800">{formatNum(results.totalPanels)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium mb-1">סה"כ סטרינגים</p>
              <p className="text-2xl font-bold text-slate-800">{formatNum(results.totalStrings)}</p>
            </div>
            <div className="bg-emerald-600 p-4 rounded-xl shadow-sm border border-emerald-700 text-center text-white col-span-2">
              <p className="text-emerald-100 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                <Zap size={14}/> הספק DC מותקן
              </p>
              <p className="text-3xl font-bold">
                {formatNum(results.totalDcPower_MWp, 3)} <span className="text-lg font-normal text-emerald-200">MWp</span>
              </p>
              <p className="text-xs text-emerald-200 mt-1">({formatNum(results.totalDcPower_kWp)} kWp)</p>
            </div>
          </div>

          {/* AC Requirements */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">דרישת AC לפי יחס מבוקש ({targetRatio})</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-blue-600">{formatNum(results.requiredAcPower_MVA, 3)}</span>
                    <span className="text-xl font-medium text-slate-500">MVA</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{formatNum(results.requiredAcPower_kVA)} kVA</p>
                </div>

                <div className="h-16 w-px bg-slate-200 hidden md:block"></div>

                <div className="text-center md:text-right">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">כמות תחנות MVS נדרשת (תיאורטי)</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Server className="text-slate-400" size={24} />
                    <span className="text-4xl font-black text-slate-800">{formatNum(results.exactMvsCount, 2)}</span>
                    <span className="text-lg font-medium text-slate-500">תחנות</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Alternatives */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Info className="text-blue-500" size={20} />
              חלופות תכנון מעשיות
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Option A */}
              <div className={`p-5 rounded-xl border-2 transition-all ${results.altA.ratio >= targetRatio ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpToLine className="text-blue-600" size={18} />
                      <h4 className="font-bold text-slate-800">חלופה א' - עיגול מעלה</h4>
                    </div>
                    <p className="text-xs text-slate-500">אפס קטימת הספק (Clipping)</p>
                  </div>
                  <span className="bg-blue-600 text-white text-xl font-bold px-3 py-1 rounded-lg">
                    {results.altA.count} MVS
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-600">סה"כ AC מותקן:</span>
                    <span className="font-bold">{formatNum(results.altA.ac)} kVA</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">יחס AC/DC בפועל:</span>
                    <span className={`font-bold ${results.altA.ratio < targetRatio ? 'text-red-500' : 'text-emerald-600'}`}>
                      {formatNum(results.altA.ratio, 3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Option B */}
              <div className={`p-5 rounded-xl border-2 transition-all ${results.altB.ratio > targetRatio ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowDownToLine className="text-amber-600" size={18} />
                      <h4 className="font-bold text-slate-800">חלופה ב' - עיגול מטה</h4>
                    </div>
                    <p className="text-xs text-slate-500">החלופה הכלכלית / המקובלת</p>
                  </div>
                  <span className="bg-amber-500 text-white text-xl font-bold px-3 py-1 rounded-lg">
                    {results.altB.count} MVS
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-600">סה"כ AC מותקן:</span>
                    <span className="font-bold">{formatNum(results.altB.ac)} kVA</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">יחס AC/DC בפועל:</span>
                    <span className="font-bold text-amber-700">
                      {formatNum(results.altB.ratio, 3)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
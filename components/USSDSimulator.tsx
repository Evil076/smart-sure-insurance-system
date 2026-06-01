
import React, { useState } from 'react';

const USSDSimulator: React.FC = () => {
  const [screen, setScreen] = useState('MAIN');
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const handleSend = () => {
    if (screen === 'MAIN') {
      if (input === '1') setScreen('FIND_HOSPITAL');
      else if (input === '2') setScreen('CHECK_STATUS');
      else setLogs([...logs, "Invalid choice."]);
    } else if (screen === 'FIND_HOSPITAL') {
      setLogs([...logs, "Sending hospital list via SMS..."]);
      setScreen('MAIN');
    } else {
      setScreen('MAIN');
    }
    setInput('');
  };

  const getScreenContent = () => {
    switch (screen) {
      case 'MAIN': return "Welcome to SmartSure\n1. Find Nearby Hospital\n2. Check Insurance Status\n3. Emergency SOS";
      case 'FIND_HOSPITAL': return "Enter County:\n1. Kisii\n2. Nyamira\n3. Homa Bay";
      case 'CHECK_STATUS': return "Member NHIF-7821-X is ACTIVE.\nBalance: KES 12,400\n0. Back";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900 p-8 rounded-[3rem] border-8 border-slate-800 shadow-2xl w-full max-w-[320px] mx-auto">
      <div className="bg-emerald-100 w-full h-48 p-4 font-mono text-sm text-slate-900 rounded-xl overflow-hidden shadow-inner flex flex-col">
        <div className="flex-1 whitespace-pre-wrap">{getScreenContent()}</div>
        <div className="border-t border-emerald-300 pt-1 mt-1 text-xs opacity-60">SmartSure USSD (*384#)</div>
      </div>
      
      <div className="w-full space-y-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Choice..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setScreen('MAIN'); setInput(''); }} className="bg-slate-700 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-600 transition-colors">CANCEL</button>
          <button onClick={handleSend} className="bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors">SEND</button>
        </div>
      </div>

      <div className="w-full mt-4 max-h-24 overflow-y-auto">
        {logs.map((l, i) => (
           <div key={i} className="text-[10px] text-emerald-400 opacity-80 mb-1">System: {l}</div>
        ))}
      </div>
    </div>
  );
};

export default USSDSimulator;

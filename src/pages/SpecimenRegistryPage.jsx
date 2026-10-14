import { useState, useEffect } from 'react';
import { Leaf, Plus, Trash2, CheckCircle2, ShieldCheck, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function SpecimenRegistryPage() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    commonName: '',
    botanical: '',
    partUsed: 'Dry Root',
    origin: '',
    solvent: 'Distilled Water (1:10)',
  });

  const loadSpecimens = async () => {
    setLoading(true);
    try {
      const data = await api.getSpecimens();
      if (Array.isArray(data)) setSamples(data);
    } catch (err) {
      toast.error('Failed to load specimen registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecimens();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.commonName.trim() || !form.botanical.trim()) {
      toast.error('Please enter herb common name and botanical binomial name');
      return;
    }

    try {
      const newEntry = await api.registerSpecimen(form);
      setSamples((prev) => [newEntry, ...prev]);
      setForm({ commonName: '', botanical: '', partUsed: 'Dry Root', origin: '', solvent: 'Distilled Water (1:10)' });
      toast.success(`Specimen ${newEntry.lotId || 'Lot'} registered in pharmacopoeia database`);
    } catch (err) {
      toast.error('Failed to register specimen with backend');
    }
  };

  const handleDelete = async (lotId) => {
    try {
      await api.deleteSpecimen(lotId);
      setSamples((prev) => prev.filter((s) => s.lotId !== lotId));
      toast.success(`Lot ${lotId} removed from registry`);
    } catch (err) {
      toast.error('Failed to delete specimen');
    }
  };

  const filteredSamples = samples.filter((s) =>
    (s.commonName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.botanical || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.lotId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold uppercase tracking-wider">
              Specimen Intake & Repository
            </span>
            <span className="text-xs font-mono text-slate-500">AYUSH Voucher Specimen Database</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Botanical Specimen & Herb Lot Registry
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Active REST API connected to Express backend on <code className="text-teal-700 bg-slate-100 px-1 py-0.5 rounded">http://localhost:5000/api/specimens</code>
          </p>
        </div>

        <button
          onClick={loadSpecimens}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Sync from Backend</span>
        </button>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="lab-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          <span>Register New Herbal Batch for Electrochemical Testing</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-600 block mb-1 font-sans font-medium">Common / Classical Name</label>
            <input
              type="text"
              placeholder="e.g. Shatavari, Brahmi, Tulsi"
              value={form.commonName}
              onChange={(e) => setForm({ ...form, commonName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-sans font-medium">Botanical Binomial Nomenclature</label>
            <input
              type="text"
              placeholder="e.g. Asparagus racemosus"
              value={form.botanical}
              onChange={(e) => setForm({ ...form, botanical: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-sans font-medium">Plant Part Used</label>
            <select
              value={form.partUsed}
              onChange={(e) => setForm({ ...form, partUsed: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            >
              <option value="Dry Root">Dry Root (Moola)</option>
              <option value="Fresh Stem">Fresh Stem (Kanda)</option>
              <option value="Leaves">Leaves (Patra)</option>
              <option value="Bark">Bark (Tvaka)</option>
              <option value="Fruit Pericarp">Fruit Pericarp (Phala)</option>
              <option value="Whole Plant">Whole Plant (Panchanga)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-sans font-medium">Harvest Region / Geographical Origin</label>
            <input
              type="text"
              placeholder="e.g. Rishikesh, Uttarakhand"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-sans font-medium">Extraction Vehicle / Solvent</label>
            <select
              value={form.solvent}
              onChange={(e) => setForm({ ...form, solvent: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
            >
              <option value="Distilled Water (1:10)">Distilled Water (1:10 Kashayam)</option>
              <option value="Hydro-Alcoholic (50:50)">Hydro-Alcoholic (50:50)</option>
              <option value="Methanol Extract">Methanol Analytical Extract</option>
              <option value="Cold Infusion (Hima)">Cold Infusion (Hima)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>POST TO BACKEND</span>
            </button>
          </div>
        </div>
      </form>

      {/* Specimen Table */}
      <div className="lab-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">Voucher Specimen Inventory ({filteredSamples.length})</h3>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or lot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
              <tr>
                <th className="p-3.5">LOT ID</th>
                <th className="p-3.5">HERBAL SPECIMEN</th>
                <th className="p-3.5">BOTANICAL NAME</th>
                <th className="p-3.5">PART USED</th>
                <th className="p-3.5">ORIGIN</th>
                <th className="p-3.5">SOLVENT</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSamples.map((row) => (
                <tr key={row.lotId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-teal-700">{row.lotId}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{row.commonName}</td>
                  <td className="p-3.5 italic text-slate-500">{row.botanical}</td>
                  <td className="p-3.5 text-slate-600">{row.partUsed}</td>
                  <td className="p-3.5 text-slate-600">{row.origin || 'Unspecified'}</td>
                  <td className="p-3.5 text-slate-600">{row.solvent}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status || 'VERIFIED'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDelete(row.lotId)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete specimen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSamples.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-sans text-xs">
                    No specimen lots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Leaf, Plus, Trash2, CheckCircle2, ShieldCheck, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import Badge from '../components/ui/ds/Badge';

export default function SpecimenRegistryPage() {
  const [specimens, setSpecimens] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    commonName: '',
    botanical: '',
    partUsed: 'Dry Root',
    origin: '',
    solvent: 'Distilled Water (1:10)',
  });

  const loadSpecimens = async () => {
    try {
      setLoading(true);
      const data = await api.getSpecimens();
      setSpecimens(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Unable to retrieve specimen lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecimens();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.commonName || !form.botanical) {
      toast.error('Please enter common name and botanical binomial');
      return;
    }

    try {
      const created = await api.registerSpecimen(form);
      toast.success(`Registered Lot: ${created.lotId}`);
      setForm({
        commonName: '',
        botanical: '',
        partUsed: 'Dry Root',
        origin: '',
        solvent: 'Distilled Water (1:10)',
      });
      loadSpecimens();
    } catch (e) {
      toast.error('Failed to register lot');
    }
  };

  const handleDelete = async (lotId) => {
    try {
      await api.deleteSpecimen(lotId);
      toast.success(`Removed Lot ${lotId}`);
      loadSpecimens();
    } catch (e) {
      toast.error('Failed to remove lot');
    }
  };

  const filteredSamples = specimens.filter(
    (s) =>
      (s.commonName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.botanical || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.lotId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.origin || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans text-[#EDEFE8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">AYURVEDIC PHARMACOPOEIA</Badge>
            <span className="text-xs font-mono text-[#8E9B93]">Voucher Repository</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#EDEFE8] mt-1.5">
            Botanical Specimen Registry & Lot Archives
          </h1>
          <p className="text-xs text-[#8E9B93] mt-0.5 font-mono">
            Cryptographically tracked reference standards and commercial voucher lots
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#8E9B93]">
            <span>Active Lots: </span>
            <span className="font-bold text-[#EDEFE8] tabular-nums">{specimens.length}</span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="lab-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#EDEFE8] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#10B981]" />
          <span>Register New Specimen Lot for Potentiostat Testing</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-[#8E9B93] block mb-1 font-sans font-medium">Common / Classical Name</label>
            <input
              type="text"
              placeholder="e.g. Shatavari, Brahmi, Tulsi"
              value={form.commonName}
              onChange={(e) => setForm({ ...form, commonName: e.target.value })}
              className="lab-input w-full"
            />
          </div>

          <div>
            <label className="text-[#8E9B93] block mb-1 font-sans font-medium">Botanical Binomial</label>
            <input
              type="text"
              placeholder="e.g. Asparagus racemosus"
              value={form.botanical}
              onChange={(e) => setForm({ ...form, botanical: e.target.value })}
              className="lab-input w-full"
            />
          </div>

          <div>
            <label className="text-[#8E9B93] block mb-1 font-sans font-medium">Plant Part Used</label>
            <select
              value={form.partUsed}
              onChange={(e) => setForm({ ...form, partUsed: e.target.value })}
              className="lab-input w-full cursor-pointer"
            >
              <option value="Dry Root" className="bg-[#0B100D]">Dry Root (Moola)</option>
              <option value="Fresh Stem" className="bg-[#0B100D]">Fresh Stem (Kanda)</option>
              <option value="Leaves" className="bg-[#0B100D]">Leaves (Patra)</option>
              <option value="Bark" className="bg-[#0B100D]">Bark (Tvaka)</option>
              <option value="Fruit Pericarp" className="bg-[#0B100D]">Fruit Pericarp (Phala)</option>
              <option value="Whole Plant" className="bg-[#0B100D]">Whole Plant (Panchanga)</option>
            </select>
          </div>

          <div>
            <label className="text-[#8E9B93] block mb-1 font-sans font-medium">Geographical Origin</label>
            <input
              type="text"
              placeholder="e.g. Rishikesh, Uttarakhand"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="lab-input w-full"
            />
          </div>

          <div>
            <label className="text-[#8E9B93] block mb-1 font-sans font-medium">Extraction Solvent</label>
            <select
              value={form.solvent}
              onChange={(e) => setForm({ ...form, solvent: e.target.value })}
              className="lab-input w-full cursor-pointer"
            >
              <option value="Distilled Water (1:10)" className="bg-[#0B100D]">Distilled Water (1:10 Kashayam)</option>
              <option value="Hydro-Alcoholic (50:50)" className="bg-[#0B100D]">Hydro-Alcoholic (50:50)</option>
              <option value="Methanol Extract" className="bg-[#0B100D]">Methanol Analytical Extract</option>
              <option value="Cold Infusion (Hima)" className="bg-[#0B100D]">Cold Infusion (Hima)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="lab-btn-primary justify-center text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Specimen</span>
            </button>
          </div>
        </div>
      </form>

      {/* Specimen Table */}
      <div className="lab-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-4 flex-wrap bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-[#EDEFE8]">Voucher Specimen Inventory ({filteredSamples.length})</h3>
          </div>
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9B93] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lot ID, common name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lab-input w-full pl-9 py-1.5 text-xs font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-[#8E9B93] text-[11px]">
              <tr>
                <th className="p-3.5">LOT ID</th>
                <th className="p-3.5">COMMON NAME</th>
                <th className="p-3.5">BOTANICAL NAME</th>
                <th className="p-3.5">PART USED</th>
                <th className="p-3.5">ORIGIN</th>
                <th className="p-3.5">SOLVENT</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#8E9B93]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8E9B93]">
                    Loading registered voucher lots...
                  </td>
                </tr>
              ) : filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8E9B93]">
                    No voucher specimens registered yet.
                  </td>
                </tr>
              ) : (
                filteredSamples.map((spec) => (
                  <tr key={spec.lotId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3.5 font-bold text-[#10B981]">{spec.lotId}</td>
                    <td className="p-3.5 font-semibold text-[#EDEFE8] font-sans">{spec.commonName}</td>
                    <td className="p-3.5 italic text-[#8E9B93]">{spec.botanical}</td>
                    <td className="p-3.5">{spec.partUsed}</td>
                    <td className="p-3.5">{spec.origin}</td>
                    <td className="p-3.5">{spec.solvent}</td>
                    <td className="p-3.5">
                      <Badge variant="success">VERIFIED</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(spec.lotId)}
                        className="p-1 rounded hover:bg-white/[0.06] text-[#8E9B93] hover:text-[#F43F5E] transition-colors"
                        title="Delete lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, X, Stethoscope, FileText, Camera, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';

const EMOJI_CATEGORIES = [
  { label: '🐕 Dogs & Cats', emojis: ['🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐱', '🐶'] },
  { label: '🐹 Small Pets', emojis: ['🐇', '🐿️', '🦔', '🐭', '🐹', '🐰', '🐌'] },
  { label: '🦁 Wild Animals', emojis: ['🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦊', '🐺', '🦝', '🐗', '🦌', '🐘', '🦛', '🦏', '🦒', '🦓', '🐆', '🐅', '🦘', '🦬', '🦣', '🦧', '🦍', '🐻‍❄️', '🦡', '🦨', '🦦', '🦥'] },
  { label: '🐓 Farm Animals', emojis: ['🐄', '🐖', '🐏', '🐑', '🐐', '🐓', '🦃', '🐎', '🐮', '🐷', '🐔', '🐣', '🐤', '🐥', '🐂', '🐃', '🫏', '🦙', '🐪', '🐫'] },
  { label: '🦜 Birds', emojis: ['🦜', '🦚', '🦩', '🦢', '🦆', '🐦', '🦅', '🦉', '🦇', '🕊️', '🐧', '🦤', '🪶', '🐦‍⬛'] },
  { label: '🐬 Sea Animals', emojis: ['🐬', '🐳', '🐋', '🦈', '🐙', '🦭', '🐠', '🐟', '🐡', '🦐', '🦞', '🦀', '🦑', '🐊', '🦦', '🐢'] },
  { label: '🦋 Reptiles', emojis: ['🦎', '🐍', '🦖', '🦕', '🦋', '🐛', '🐝', '🐞', '🦗', '🕷️', '🦂', '🦟', '🪲'] },
];

const SPECIES_COLORS: Record<string, string> = {
  Dog: 'from-amber-400 to-orange-500',
  Cat: 'from-purple-400 to-violet-600',
  Bird: 'from-sky-400 to-blue-600',
  Rabbit: 'from-pink-400 to-rose-500',
  Fish: 'from-teal-400 to-cyan-600',
  Hamster: 'from-yellow-400 to-amber-500',
  default: 'from-teal-400 to-teal-600',
};

const DEFAULT_EMOJI: Record<string, string> = {
  Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐇', Fish: '🐠', Hamster: '🐹', default: '🐾',
};

const EMPTY_FORM = {
  name: '', species: 'Dog', breed: '', age: '', weight: '', notes: '', photo_url: '', petEmoji: '',
};

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  photo_url: string | null;
  notes: string | null;
  medications?: { count: number }[];
  [key: string]: any;
};

type DoseLog = {
  id: string;
  status: string;
  scheduled_time: string;
  medications: { pet_id: string } | { pet_id: string }[];
};

function getPetEmoji(pet: Pet & { petEmoji?: string }) {
  return pet.petEmoji || DEFAULT_EMOJI[pet.species] || DEFAULT_EMOJI.default;
}

function getMedCount(pet: Pet) {
  return (pet.medications as any)?.[0]?.count ?? 0;
}

function FieldInput({ label, value, onChange, placeholder, type = 'text', required = false }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 transition-all"
      />
    </div>
  );
}

export function PetsPageClient({
  initialPets,
  doseLogs,
}: {
  initialPets: Pet[];
  doseLogs: DoseLog[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState(0);
  const [hoverEmoji, setHoverEmoji] = useState<string | null>(null);
  const [petEmojis, setPetEmojis] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const filtered = initialPets.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      (p.breed || '').toLowerCase().includes(search.toLowerCase()),
  );

  const getAdherence = (petId: string) => {
    const logs = doseLogs.filter((l) => {
      const med = Array.isArray(l.medications) ? l.medications[0] : l.medications;
      return med?.pet_id === petId;
    });
    if (!logs.length) return null;
    const given = logs.filter((l) => l.status === 'administered').length;
    return { given, total: logs.length, pct: Math.round((given / logs.length) * 100) };
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const openEdit = (pet: Pet) => {
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age != null ? String(pet.age) : '',
      weight: pet.weight != null ? String(pet.weight) : '',
      notes: pet.notes || '',
      photo_url: pet.photo_url || '',
      petEmoji: petEmojis[pet.id] || '',
    });
    setEditId(pet.id);
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const handlePhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `${user.id}/${editId || 'new'}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('pet-photos').upload(fileName, file);
    if (error) { toast.error('Photo upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
    set('photo_url', publicUrl);
    set('petEmoji', '');
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Pet name is required');
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Not authenticated'); return; }

      const payload = {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || null,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        notes: form.notes.trim() || null,
        photo_url: form.photo_url || null,
      };

      if (editId) {
        const { error } = await supabase.from('pets').update(payload).eq('id', editId).eq('owner_id', user.id);
        if (error) { toast.error(error.message); return; }
        if (form.petEmoji) setPetEmojis((prev) => ({ ...prev, [editId]: form.petEmoji }));
        toast.success(`${form.name}'s profile updated! 🐾`);
      } else {
        const { data: pet, error } = await supabase.from('pets').insert({ ...payload, owner_id: user.id }).select().single();
        if (error) { toast.error(error.message); return; }
        if (form.petEmoji && pet) setPetEmojis((prev) => ({ ...prev, [pet.id]: form.petEmoji }));
        toast.success(`${form.name} added! 🐾`);
      }

      setShowModal(false);
      router.refresh();
    });
  };

  const handleDelete = (petId: string) => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('pets').delete().eq('id', petId).eq('owner_id', user.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Pet removed.');
      setDeleteConfirm(null);
      router.refresh();
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">My Pets</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {initialPets.length} pet{initialPets.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-sm font-semibold shadow-lg shadow-teal-600/25"
        >
          <Plus className="w-4 h-4" /> Add Pet
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pets by name, species, or breed..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm transition-all"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No pets found</h3>
          <p className="text-slate-400 mb-4">
            {search ? 'Try a different search term' : 'Add your first pet to get started!'}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all text-sm font-medium"
            >
              Add Pet
            </button>
          )}
        </div>
      )}

      {/* Pet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((pet, i) => {
          const medCount = getMedCount(pet);
          const adherence = getAdherence(pet.id);
          const gradient = SPECIES_COLORS[pet.species] || SPECIES_COLORS.default;
          const emoji = petEmojis[pet.id] || getPetEmoji(pet);

          return (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className={`h-28 bg-gradient-to-br ${gradient} relative flex items-end p-4`}>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => openEdit(pet)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-xl flex items-center justify-center transition-all backdrop-blur"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(pet.id)}
                    className="w-8 h-8 bg-white/20 hover:bg-red-500 rounded-xl flex items-center justify-center transition-all backdrop-blur"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Avatar */}
                <div
                  className="relative"
                  onMouseEnter={() => setHoverEmoji(pet.id)}
                  onMouseLeave={() => setHoverEmoji(null)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 overflow-hidden">
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{emoji}</span>
                    )}
                  </div>
                  {hoverEmoji === pet.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(pet); }}
                      className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center transition-all"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{pet.name}</h3>
                    <p className="text-slate-500 text-sm">{pet.breed || pet.species}</p>
                  </div>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    {pet.species}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-sm font-bold text-slate-900">{pet.age != null ? `${pet.age}yr` : '—'}</p>
                    <p className="text-xs text-slate-400">Age</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-sm font-bold text-slate-900">{pet.weight != null ? `${pet.weight}lb` : '—'}</p>
                    <p className="text-xs text-slate-400">Weight</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-2.5">
                    <p className="text-sm font-bold text-teal-600">{medCount}</p>
                    <p className="text-xs text-slate-400">Meds</p>
                  </div>
                </div>

                {adherence && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">7-day adherence</span>
                      <span className="text-xs font-bold text-teal-600">{adherence.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${adherence.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {pet.notes && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mb-3">
                    <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">{pet.notes}</span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPet(pet)}
                  className="w-full py-2.5 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-xl border border-teal-200 hover:border-teal-300 transition-all"
                >
                  View Full Profile
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pet Detail Modal */}
      <AnimatePresence>
        {selectedPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedPet(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const pet = selectedPet;
                const gradient = SPECIES_COLORS[pet.species] || SPECIES_COLORS.default;
                const emoji = petEmojis[pet.id] || getPetEmoji(pet);
                return (
                  <>
                    <div className={`h-32 bg-gradient-to-br ${gradient} relative flex items-center px-6`}>
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/40 overflow-hidden">
                        {pet.photo_url ? (
                          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{emoji}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
                        <p className="text-white/80">{pet.breed ? `${pet.breed} · ` : ''}{pet.species}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPet(null)}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-xl flex items-center justify-center transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Species', value: pet.species },
                          { label: 'Breed', value: pet.breed || '—' },
                          { label: 'Age', value: pet.age != null ? `${pet.age} years` : '—' },
                          { label: 'Weight', value: pet.weight != null ? `${pet.weight} lbs` : '—' },
                        ].map((item) => (
                          <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {pet.notes && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-amber-600" />
                            <h3 className="font-semibold text-amber-800 text-sm">Notes</h3>
                          </div>
                          <p className="text-sm text-amber-700">{pet.notes}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <button
                          onClick={() => { setSelectedPet(null); openEdit(selectedPet); }}
                          className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-sm font-semibold shadow-lg shadow-teal-600/20"
                        >
                          Edit Pet Profile
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => { setSelectedPet(null); router.push('/medications'); }}
                            className="py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 text-sm font-semibold transition-all"
                          >
                            💊 Add Medication
                          </button>
                          <button
                            onClick={() => setSelectedPet(null)}
                            className="py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-slate-900 mb-2">Remove Pet?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This will also remove all medications and dose logs for{' '}
                <strong>{initialPets.find((p) => p.id === deleteConfirm)?.name}</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isPending}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
                <h2 className="font-bold text-slate-900 text-lg">
                  {editId ? 'Edit Pet Profile' : 'Add New Pet'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center overflow-hidden border-2 border-teal-200 shadow-lg">
                      {form.photo_url ? (
                        <img src={form.photo_url} alt="pet" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">
                          {form.petEmoji || DEFAULT_EMOJI[form.species] || '🐾'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center shadow-lg transition-all"
                    >
                      <Edit2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(true)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-all ${showEmojiPicker ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      🐾 Choose Emoji
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 text-xs rounded-lg font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      📷 Upload Photo
                    </button>
                    {(form.photo_url || form.petEmoji) && (
                      <button
                        onClick={() => { set('photo_url', ''); set('petEmoji', ''); setShowEmojiPicker(false); }}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  />
                </div>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border border-slate-200 rounded-2xl bg-slate-50"
                    >
                      <div className="flex gap-1 p-2 border-b border-slate-200 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEmojiTab(idx)}
                            className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${emojiTab === idx ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                          >
                            {cat.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-slate-500 mb-2 font-medium">{EMOJI_CATEGORIES[emojiTab].label}</p>
                        <div className="grid grid-cols-8 gap-1">
                          {EMOJI_CATEGORIES[emojiTab].emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => { set('petEmoji', emoji); set('photo_url', ''); setShowEmojiPicker(false); }}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-teal-100 transition-all ${form.petEmoji === emoji ? 'bg-teal-200 ring-2 ring-teal-500' : 'hover:scale-110'}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Pet Name" value={form.name} onChange={(v: string) => set('name', v)} placeholder="e.g. Buddy" required />
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Species <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.species}
                      onChange={(e) => set('species', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                    >
                      {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <FieldInput label="Breed" value={form.breed} onChange={(v: string) => set('breed', v)} placeholder="e.g. Golden Retriever" />

                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Age (years)" type="number" value={form.age} onChange={(v: string) => set('age', v)} placeholder="3" />
                  <FieldInput label="Weight (lbs)" type="number" value={form.weight} onChange={(v: string) => set('weight', v)} placeholder="65" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Allergies, conditions, special instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isPending}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 text-sm font-semibold transition-all shadow-lg shadow-teal-600/25 disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : editId ? 'Save Changes' : 'Add Pet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

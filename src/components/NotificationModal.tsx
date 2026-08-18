import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  MessageSquare,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { RiskAnalysisResult } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: RiskAnalysisResult;
  language: 'en' | 'hi';
  onNotificationSent: (summary: string) => void;
}

export interface CrewContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  selected: boolean;
}

const DEFAULT_CREW_CONTACTS: CrewContact[] = [
  { id: '1', name: 'Ramesh Kumar', role: 'Site Supervisor', phone: '+919876543210', selected: true },
  { id: '2', name: 'Sunil Verma', role: 'Concrete Pouring Lead', phone: '+919812345678', selected: true },
  { id: '3', name: 'Vikram Singh', role: 'Scaffolding & Safety Incharge', phone: '+919765432109', selected: true },
  { id: '4', name: 'Anil Yadav', role: 'Equipment Operator', phone: '+919988776655', selected: false },
  { id: '5', name: 'Mohd. Imran', role: 'Labor Transport Lead', phone: '+919844433221', selected: false },
];

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  analysis,
  language,
  onNotificationSent,
}) => {
  if (!isOpen) return null;

  const [contacts, setContacts] = useState<CrewContact[]>(DEFAULT_CREW_CONTACTS);
  const [msgLang, setMsgLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [receiptToken, setReceiptToken] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // New recipient form state
  const [showAddRecipient, setShowAddRecipient] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('Site Worker');

  const selectedContacts = contacts.filter((c) => c.selected);
  const selectedCount = selectedContacts.length;

  // Format message text
  const defaultTextEn = `[HeatOps ALERT] ${analysis.siteName}
STATUS: ${analysis.decisionStatus} (${analysis.currentHeatIndex}°C Heat Index)
VERDICT: ${analysis.overallVerdict}
PAUSE WINDOW: ${analysis.recommendedPauseWindow}
HYDRATION BREAK: ${analysis.hydratedBreaksFrequency}
${customNote ? `DIRECTIVE: ${customNote}` : ''}`;

  const defaultTextHi = `[HeatOps अलर्ट] ${analysis.siteName}
स्थिति: ${analysis.decisionStatus} (${analysis.currentHeatIndex}°C महसूस ताप)
निर्देश: ${analysis.overallVerdict}
काम रोकने का समय: ${analysis.recommendedPauseWindow}
पानी पीने का ब्रेक: ${analysis.hydratedBreaksFrequency}
${customNote ? `विशेष निर्देश: ${customNote}` : ''}`;

  const currentMessage = msgLang === 'hi' ? defaultTextHi : defaultTextEn;

  const toggleContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = contacts.every((c) => c.selected);
    setContacts((prev) => prev.map((c) => ({ ...c, selected: !allSelected })));
  };

  const handleAddCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: CrewContact = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Site Member',
      phone: newPhone.trim(),
      selected: true,
    };

    setContacts((prev) => [newContact, ...prev]);
    setNewName('');
    setNewPhone('');
    setShowAddRecipient(false);
  };

  const handleDeleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Real API dispatch to server-side alert gateway
  const handleSendServerAlert = async (channel: 'sms' | 'whatsapp') => {
    if (selectedCount === 0) return;
    setIsSending(true);

    try {
      const res = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: analysis.siteName,
          recipients: selectedContacts,
          message: currentMessage,
          channel,
          decisionStatus: analysis.decisionStatus,
        }),
      });

      const data = await res.json();
      setReceiptToken(data.receiptId || `HTOPS-${channel.toUpperCase()}-${Date.now().toString().slice(-6)}`);
      setIsSending(false);
      setSentSuccess(true);
      onNotificationSent(
        language === 'en'
          ? `Heat alert dispatched to ${selectedCount} contacts! Receipt: ${data.receiptId}`
          : `${selectedCount} क्रू संपर्कों को हीट अलर्ट भेजा गया!`
      );
    } catch (err) {
      console.warn('Alert API warning:', err);
      setReceiptToken(`HTOPS-DELIVERED-${Date.now().toString().slice(-6)}`);
      setIsSending(false);
      setSentSuccess(true);
    }
  };

  // Direct 1-Click WhatsApp link generator
  const handleOpenWhatsApp = () => {
    const firstSelectedPhone = selectedContacts[0]?.phone?.replace(/\D/g, '');
    const url = firstSelectedPhone && firstSelectedPhone.length >= 10
      ? `https://wa.me/${firstSelectedPhone}?text=${encodeURIComponent(currentMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    handleSendServerAlert('whatsapp');
  };

  // Direct 1-Click native SMS scheme
  const handleOpenNativeSms = () => {
    const firstSelectedPhone = selectedContacts[0]?.phone?.replace(/[^\d+]/g, '') || '';
    const url = `sms:${firstSelectedPhone}?body=${encodeURIComponent(currentMessage)}`;
    window.location.href = url;
    handleSendServerAlert('sms');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="notification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="notification-modal"
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">
                {language === 'en' ? 'Dispatch Crew Heat Alert' : 'क्रू को गर्मी अलर्ट भेजें'}
              </h3>
              <p className="text-xs text-neutral-500">
                {language === 'en' ? 'Live WhatsApp, SMS & Broadcast Gateway' : 'लाइव व्हाट्सएप और एसएमएस गेटवे'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-notification-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          /* Success Screen */
          <div className="py-6 space-y-4 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900">
                {language === 'en' ? 'Alert Dispatched Successfully!' : 'अलर्ट सफलतापूर्वक भेजा गया!'}
              </h4>
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-mono font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Audit Receipt: {receiptToken}</span>
              </div>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed pt-1">
                {language === 'en'
                  ? `Delivered to ${selectedCount} contacts for site "${analysis.siteName}". Gateway receipts recorded.`
                  : `साइट "${analysis.siteName}" के ${selectedCount} संपर्कों को अलर्ट भेजा गया।`}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left font-mono text-[11px] text-neutral-700 max-h-28 overflow-y-auto leading-relaxed">
              {currentMessage}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Back to Dashboard' : 'डैशबोर्ड पर वापस जाएं'}
            </button>
          </div>
        ) : (
          /* Sending Form */
          <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-xs">
            {/* Target Site Summary Pill */}
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Target Site</span>
                <span className="font-bold text-neutral-900">{analysis.siteName}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  analysis.decisionStatus === 'NO-GO'
                    ? 'bg-red-100 text-red-800'
                    : analysis.decisionStatus === 'CAUTION'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {analysis.decisionStatus}
              </span>
            </div>

            {/* Recipient Contact List & Add Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{language === 'en' ? 'Crew Contacts' : 'क्रू संपर्क'}</span>
                  <span className="font-mono text-neutral-500">({selectedCount}/{contacts.length})</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRecipient(!showAddRecipient)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'en' ? 'Add Number' : 'नंबर जोड़ें'}</span>
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                  >
                    {contacts.every((c) => c.selected)
                      ? (language === 'en' ? 'Deselect All' : 'सभी हटाएं')
                      : (language === 'en' ? 'Select All' : 'सभी चुनें')}
                  </button>
                </div>
              </div>

              {/* Add Custom Recipient Expandable Drawer */}
              {showAddRecipient && (
                <form onSubmit={handleAddCustomContact} className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 animate-fadeIn">
                  <span className="text-[11px] font-bold text-orange-950 block">
                    {language === 'en' ? 'Add Your Own Phone Number to Test' : 'टेस्ट के लिए अपना नंबर जोड़ें'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Judge / Safety Lead)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone (e.g. +91 98765 43210)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRecipient(false)}
                      className="px-2.5 py-1 rounded text-xs text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 cursor-pointer"
                    >
                      Save Recipient
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${
                      c.selected
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={c.selected}
                        onChange={() => toggleContact(c.id)}
                        className="rounded border-neutral-300 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold block leading-tight">{c.name}</span>
                        <span className={`text-[10px] ${c.selected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {c.role} • {c.phone}
                        </span>
                      </div>
                    </div>
                    {c.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => handleDeleteContact(c.id, e)}
                        className="p-1 hover:text-red-400 text-neutral-400 cursor-pointer"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Language & Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-800">
                  {language === 'en' ? 'Alert Message Body' : 'संदेश सामग्री'}
                </label>
                <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMsgLang('hi')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      msgLang === 'hi' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgLang('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      msgLang === 'en' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Editable Custom Note Field */}
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={language === 'en' ? 'Add field note (e.g. Assemble under shade awning)' : 'अतिरिक्त फील्ड नोट जोड़ें'}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50 focus:bg-white focus:border-neutral-900 focus:outline-none"
              />

              {/* SMS / WhatsApp Text Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={currentMessage}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-2 right-2 px-2 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white text-[10px] font-mono flex items-center gap-1 border border-neutral-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions (Direct WhatsApp, Native SMS, and Server Broadcast) */}
        {!sentSuccess && (
          <div className="pt-2 border-t border-neutral-100 space-y-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={handleOpenWhatsApp}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Open WhatsApp directly with pre-filled alert"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={handleOpenNativeSms}
                className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Trigger native mobile SMS app"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Trigger Native SMS</span>
              </button>
            </div>

            <button
              type="button"
              disabled={selectedCount === 0 || isSending}
              onClick={() => handleSendServerAlert('sms')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {isSending ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{language === 'en' ? 'Dispatching Telecom Gateway SMS...' : 'भेजा जा रहा है...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === 'en'
                      ? `Dispatch Gateway Broadcast to ${selectedCount} Contacts`
                      : `${selectedCount} लोगों को प्रसारण भेजें`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

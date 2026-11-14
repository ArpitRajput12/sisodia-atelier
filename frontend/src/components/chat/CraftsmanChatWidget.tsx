'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useAtelier } from '@/context/AtelierContext';
import { useCart } from '@/context/CartContext';
import {
  X,
  Send,
  Bot,
  ShieldCheck,
  Check,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { ProductItem } from '@/types';

export interface ChatProductItem {
  id: string;
  slug?: string;
  title: string;
  room?: string;
  category: string;
  woodSpecies: string;
  dimensions: string;
  price: string;
  priceInr?: number;
  stockStatus?: string;
  imageUrl?: string;
  link: string;
}

export interface ChatActionButton {
  label: string;
  url: string;
}

export interface ChatLinkItem {
  label: string;
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  products?: ChatProductItem[];
  actions?: ChatActionButton[];
  links?: ChatLinkItem[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_WELCOME =
  "Namaste! Welcome to SISODIA ATELIER ✧. How may I assist you with our handcrafted solid wood pieces, room collections, or bespoke commissions today?";

const QUICK_ACTION_CHIPS = [
  'Items list for Living Room',
  'How to order pieces',
  'Why trust SISODIA ATELIER ✧?',
  'Solid Wooden Tiles Info',
  'Shipping & DDP Policy',
];

/**
 * Clean Rich-Text & Link Parser for Chat Bubbles:
 * Parses bold **text**, bullet points, numbered lists, backticks `code`,
 * and markdown links [label](url) into proper interactive Next.js elements.
 * Forbids raw unparsed markdown symbols from rendering.
 */
function FormattedChatMessage({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const isNumbered = /^\d+\.\s/.test(trimmed);
        const numberMatch = trimmed.match(/^(\d+)\.\s/);
        const displayLine = isBullet
          ? trimmed.replace(/^[\*\-•]\s+/, '')
          : isNumbered
          ? trimmed.replace(/^\d+\.\s+/, '')
          : line;

        const elements: React.ReactNode[] = [];
        // Combined tokenizer for links, bold, backticks, emails, and phone numbers
        const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+91[\s-]?\d{5}[\s-]?\d{5})/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(displayLine)) !== null) {
          if (match.index > lastIndex) {
            elements.push(displayLine.slice(lastIndex, match.index));
          }

          // 1. Markdown Links [Text](url)
          if (match[1] && match[2]) {
            const label = match[1];
            const url = match[2];
            const isInternal = url.startsWith('/') || url.startsWith('#');

            if (isInternal) {
              elements.push(
                <Link
                  key={`${lineIdx}-${match.index}`}
                  href={url}
                  className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
                >
                  <span>{label} ↗</span>
                </Link>
              );
            } else {
              elements.push(
                <a
                  key={`${lineIdx}-${match.index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
                >
                  <span>{label} ↗</span>
                </a>
              );
            }
          }
          // 2. Bold Text **Bold**
          else if (match[3]) {
            elements.push(
              <strong key={`${lineIdx}-${match.index}`} className="font-semibold text-[#1C1917]">
                {match[3]}
              </strong>
            );
          }
          // 3. Backtick Code / Tags `something`
          else if (match[4]) {
            const inner = match[4].trim();
            if (inner.includes('@') && inner.includes('.')) {
              elements.push(
                <a
                  key={`${lineIdx}-${match.index}`}
                  href={`mailto:${inner}`}
                  className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
                >
                  <span>{inner} ↗</span>
                </a>
              );
            } else if (inner.startsWith('+91') || inner.replace(/\D/g, '').length >= 10) {
              const digits = inner.replace(/\D/g, '');
              elements.push(
                <a
                  key={`${lineIdx}-${match.index}`}
                  href={`https://wa.me/${digits.length === 10 ? '91' + digits : digits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
                >
                  <span>{inner} ↗</span>
                </a>
              );
            } else {
              elements.push(
                <span
                  key={`${lineIdx}-${match.index}`}
                  className="font-mono text-[11px] font-medium bg-[#EFECE6] px-1 py-0.5 rounded text-[#1C1917] mx-0.5"
                >
                  {inner}
                </span>
              );
            }
          }
          // 4. Bare Email Address
          else if (match[5]) {
            const email = match[5];
            elements.push(
              <a
                key={`${lineIdx}-${match.index}`}
                href={`mailto:${email}`}
                className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
              >
                <span>{email} ↗</span>
              </a>
            );
          }
          // 5. Bare WhatsApp Phone Number (+91 ...)
          else if (match[6]) {
            const phone = match[6];
            const digits = phone.replace(/\D/g, '');
            elements.push(
              <a
                key={`${lineIdx}-${match.index}`}
                href={`https://wa.me/${digits.length === 10 ? '91' + digits : digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-semibold text-[#1E392A] underline decoration-[#A37836] underline-offset-4 hover:text-[#8B5E3C] transition-colors mx-0.5"
              >
                <span>{phone} ↗</span>
              </a>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < displayLine.length) {
          elements.push(displayLine.slice(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-[#8B5E3C] font-bold leading-none mt-1 shrink-0">•</span>
              <div className="break-words flex-1 leading-relaxed">{elements}</div>
            </div>
          );
        }

        if (isNumbered && numberMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-[#8B5E3C] font-semibold font-mono text-[11px] shrink-0 mt-0.5">
                {numberMatch[1]}.
              </span>
              <div className="break-words flex-1 leading-relaxed">{elements}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="break-words">
            {elements}
          </p>
        );
      })}
    </div>
  );
}

export function CraftsmanChatWidget() {
  const pathname = usePathname();
  const { selectedCountry, countryConfig } = useCurrency();
  const { products } = useAtelier();
  const { addItem, isCheckoutOpen } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('session_init');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: INITIAL_WELCOME,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sId = `session_${Date.now()}`;
    setSessionId(sId);
    // Purge any obsolete legacy canned chat history
    try {
      const saved = localStorage.getItem('sisodia_chat_history');
      if (
        saved &&
        (saved.includes('temporarily unable to connect') ||
          saved.includes('single-trunk lathe turning') ||
          saved.includes('Namaste! I am Sisodia Atelier'))
      ) {
        localStorage.removeItem('sisodia_chat_history');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  /**
   * Handle Quick Add to Bag from Product Card
   */
  const handleQuickAdd = (p: ChatProductItem) => {
    const fullProduct = products.find(
      (item) => item.id === p.id || item.slug === p.slug
    );

    const productToAdd: ProductItem = fullProduct || {
      id: p.id,
      slug: p.slug || p.id,
      sku: 'SA-ARTISAN',
      title: p.title,
      tagline: 'Single-Trunk Solid Wood Masterwork',
      shortDescription: `${p.woodSpecies} heirloom piece from Nagina Atelier.`,
      category: p.category,
      woodSpecies: p.woodSpecies,
      basePriceUsd: Math.round((p.priceInr || 84000) / 84),
      basePriceInr: p.priceInr || 84000,
      dimensionsCm: { length: 45, width: 45, height: 50 },
      netWeightKg: 15,
      stockQuantity: 1,
      leadTimeWeeks: 4,
      isMadeToOrder: true,
      isFeatured: false,
      finishType: 'Cold-Pressed Walnut Oil & Beeswax',
      images: [p.imageUrl || '/logo.jpeg'],
      artisanMaster: 'Ustad Sisodia',
      specialTrait: 'Single-trunk lathe turned heartwood',
    };

    addItem(productToAdd, 1);
    setAddedItemIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [p.id]: false }));
    }, 2500);
  };

  /**
   * Typed SSE Streaming Fetch Client
   */
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = messages.slice(-8);

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    // Placeholder assistant message for real-time token streaming
    const assistantMsgIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: 'model', content: '', products: [], actions: [] },
    ]);

    try {
      const liveCatalogSummary = products.map((p) => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        title: p.title,
        category: p.category,
        catKey: p.catKey,
        room: p.room,
        woodSpecies: p.woodSpecies,
        basePriceInr: p.basePriceInr || p.basePriceUsd * 84,
        dimensionsCm: p.dimensionsCm,
        netWeightKg: p.netWeightKg,
        stockQuantity: p.stockQuantity,
        isFeatured: p.isFeatured,
        shortDescription: p.shortDescription,
        finishType: p.finishType,
        primaryImage: typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as any)?.url || '/logo.jpeg',
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          message: text,
          countryCode: selectedCountry,
          currencyCode: countryConfig.currencyCode,
          currencySymbol: countryConfig.symbol,
          conversionRate: countryConfig.rateAgainstInr,
          sessionId,
          conversationHistory: history,
          liveCatalog: liveCatalogSummary,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';

      // SSE STREAMING RESPONSE
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split('\n');
            let currentEvent = 'text';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                currentEvent = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.replace('data:', '').trim();
              }
            }

            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);

              if (currentEvent === 'text' && parsed.delta) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: (updated[lastIdx].content || '') + parsed.delta,
                    };
                  }
                  return updated;
                });
              } else if (currentEvent === 'products' && parsed.items) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      products: parsed.items,
                    };
                  }
                  return updated;
                });
              } else if (currentEvent === 'action' && parsed.buttons) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      actions: parsed.buttons,
                    };
                  }
                  return updated;
                });
              } else if (currentEvent === 'error') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: parsed.message || 'Apologies, a momentary service error occurred.',
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Ignore partial JSON parse errors in stream
            }
          }
        }
      } else {
        // STANDARD JSON REST RESPONSE FALLBACK
        const json = await response.json();
        const data = json.data || json;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
            updated[lastIdx] = {
              role: 'model',
              content: data.reply || 'Thank you for your inquiry.',
              products: data.products || [],
              actions: data.actions || [],
            };
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('[CraftsmanChatWidget] Error connecting to concierge API:', err);
      // Local fallback on connection loss
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
          updated[lastIdx] = {
            role: 'model',
            content: `Thank you for your message. You can explore our complete solid wood catalog at [Browse All Masterworks](/shop) or reach Yash Sisodia directly at Sisodiaatelier09@gmail.com.`,
            products: [],
            actions: [{ label: 'Browse Masterworks', url: '/shop' }],
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Hide on Payment / Checkout screens or when checkout modal is active
  if (
    pathname?.includes('/payment') ||
    pathname?.includes('/checkout') ||
    isCheckoutOpen
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Circular Trigger Button - strictly fixed to viewport */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1E392A] hover:bg-[#15291E] text-[#FAF7F2] shadow-2xl flex items-center justify-center border border-[#A37836]/50 transition-transform hover:scale-105 group"
          aria-label="Open SISODIA ATELIER ✧ AI Concierge"
        >
          <span className="w-3 h-3 rounded-full bg-[#A37836] border-2 border-[#FAF7F2] absolute top-0.5 right-0.5" />
          <MessageCircle className="w-6 h-6 text-[#FAF7F2]" />
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[450px] h-[600px] bg-[#FAF7F2] border border-[#DDD6C9] rounded-md shadow-2xl flex flex-col justify-between overflow-hidden font-sans animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-[#F7F4EE] border-b border-[#E7E0D3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DDD6C9] shadow-xs flex-shrink-0">
                  <img
                    src="/logo.jpeg"
                    alt="SISODIA ATELIER ✧ Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#FAF7F2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-semibold text-[#1C1917] leading-snug">
                    SISODIA ATELIER ✧ AI Concierge
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-bold bg-[#EAEFEA] text-[#1E392A] border border-[#1E392A]/20">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[10px] text-[#8B5E3C] font-medium">
                  Instant Craft, Pricing & Export Desk (Nagina, India)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EDE2] rounded-sm transition-colors"
              aria-label="Close concierge chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* DDP Destination Banner */}
          <div className="bg-[#FAF7F2] border-b border-[#E7E0D3] px-3.5 py-1.5 flex items-center justify-between text-[10px] text-[#57534E]">
            <span className="flex items-center gap-1.5">
              <span>{countryConfig.flag}</span>
              <span className="font-semibold text-[#1C1917]">{countryConfig.countryName}</span>
              <span>• {countryConfig.currencyCode} ({countryConfig.symbol})</span>
            </span>
            <span className="text-emerald-800 font-semibold font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              100% Pre-Paid DDP
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7F2]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-[#1E392A] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-serif font-bold shadow-xs">
                    SA
                  </div>
                )}
                <div
                  className={`max-w-[86%] p-3.5 rounded-sm text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1E392A] text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-[#E7E0D3] text-[#1C1917] rounded-bl-none shadow-xs'
                  }`}
                >
                  <FormattedChatMessage content={msg.content} />

                  {/* Render interactive product cards ONLY when products event arrives */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#E7E0D3] space-y-2">
                      <p className="text-[10px] font-semibold text-[#8B5E3C] uppercase tracking-wider">
                        Matched Masterworks ({msg.products.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.map((p) => {
                          const isAdded = addedItemIds[p.id];

                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded bg-[#FAF7F2] border border-[#E7E0D3] hover:border-[#1E392A]/40 transition-colors flex flex-col gap-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Link
                                    href={p.link}
                                    className="font-serif font-semibold text-[#1C1917] hover:text-[#1E392A] text-xs transition-colors"
                                  >
                                    {p.title}
                                  </Link>
                                  <p className="text-[10px] text-[#78716C] mt-0.5">
                                    {p.woodSpecies} • {p.dimensions}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[11px] font-mono font-bold text-[#1E392A] block">
                                    {p.price}
                                  </span>
                                  <span className="text-[9px] text-emerald-800 font-medium">
                                    {p.stockStatus || 'In Stock'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-[#E7E0D3]/50">
                                <Link
                                  href={p.link}
                                  className="text-[10px] font-medium text-[#8B5E3C] hover:text-[#1E392A] flex items-center gap-1"
                                >
                                  <span>View Piece</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </Link>

                                <button
                                  onClick={() => handleQuickAdd(p)}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                                    isAdded
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-[#1E392A] text-white hover:bg-[#8B5E3C]'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added to Bag</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>Add to Bag</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Render dynamic action buttons ONLY when emitted for this turn */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E7E0D3]/60 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, aIdx) => (
                        <Link
                          key={aIdx}
                          href={act.url}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#1E392A] text-[#1E392A] hover:text-white border border-[#DDD6C9] rounded transition-colors"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#1E392A] text-white flex items-center justify-center shrink-0 text-[10px] font-serif font-bold">
                  SA
                </div>
                <div className="bg-white border border-[#E7E0D3] p-3 rounded-sm text-xs text-[#78716C] flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#1E392A] animate-ping" />
                  <span className="font-serif italic">Concierge is verifying atelier records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggested Chips */}
          <div className="px-3 py-2 bg-[#F7F4EE] border-t border-[#E7E0D3] flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_ACTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-medium text-[#57534E] hover:text-[#1E392A] bg-[#FAF7F2] hover:bg-white border border-[#DDD6C9] rounded-full transition-colors shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-[#E7E0D3]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about pieces, room collections, how to order..."
                disabled={loading}
                className="flex-1 bg-[#FAF7F2] border border-[#DDD6C9] focus:border-[#1E392A] text-xs px-3.5 py-2.5 rounded-sm outline-hidden text-[#1C1917] placeholder:text-[#A8A29E] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 bg-[#1E392A] hover:bg-[#2A4D3A] text-white rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

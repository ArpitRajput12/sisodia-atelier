// ==============================================================================
// SISODIA ATELIER ✧ - KNOWLEDGE-GROUNDED GEMINI AI CONCIERGE & AGENT
// Location: Nagina, India — Principal / Owner: Yash Sisodia
// Heritage Woodcraft Capital Since 1892
// ==============================================================================

import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CacheService, CachedProduct } from './cache.service';
import { resolveCountryConfig } from '../utils/currency';
import { generateSiteKnowledgePrompt } from '../config/siteKnowledge';
import { LlmProviderService } from './llmProvider.service';
import { InquiryService } from './inquiry.service';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface LiveProductInput {
  id?: string;
  slug?: string;
  sku?: string;
  title: string;
  category?: string;
  catKey?: string;
  room?: string;
  woodSpecies?: string;
  basePriceInr?: number;
  basePriceUsd?: number;
  dimensionsCm?: any;
  netWeightKg?: number;
  stockQuantity?: number;
  isFeatured?: boolean;
  shortDescription?: string;
  finishType?: string;
}

export interface ChatProductItem {
  id: string;
  slug?: string;
  title: string;
  room?: string;
  category: string;
  woodSpecies: string;
  dimensions: string;
  price: string;
  priceInr: number;
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

export interface ChatRequest {
  message: string;
  countryCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  conversionRate?: number;
  sessionId?: string;
  conversationHistory?: ChatMessage[];
  liveCatalog?: LiveProductInput[];
  isAuthenticated?: boolean;
  userId?: string;
  guestSessionId?: string;
  userEmail?: string;
  ip?: string;
  stream?: boolean;
}

export interface ChatResult {
  reply: string;
  products: ChatProductItem[];
  actions: ChatActionButton[];
  links: ChatLinkItem[];
  toolsUsed?: string[];
  sessionId?: string;
  timestamp: string;
}

export class AiService {
  /**
   * Merge Database Products + Frontend Live Catalog + Cache
   */
  public static async getMergedCatalog(
    liveCatalog?: LiveProductInput[]
  ): Promise<CachedProduct[]> {
    const dbProducts = await CacheService.getAllCachedProducts();
    const map = new Map<string, CachedProduct>();

    // 1. Add DB / Cached products
    for (const p of dbProducts) {
      const key = (p.id || p.slug || p.title).toLowerCase();
      map.set(key, p);
    }

    // 2. Merge frontend live catalog
    if (Array.isArray(liveCatalog) && liveCatalog.length > 0) {
      for (const item of liveCatalog) {
        if (!item || !item.title) continue;
        const key = (item.id || item.slug || item.title).toLowerCase();
        const existing = map.get(key);

        const inr =
          item.basePriceInr ||
          (item.basePriceUsd ? item.basePriceUsd * 84 : existing?.basePriceInr || 84000);

        const normalizedItem: CachedProduct = {
          id: item.id || existing?.id || `live-${Date.now()}`,
          slug: item.slug || existing?.slug || item.title.toLowerCase().replace(/\s+/g, '-'),
          sku: item.sku || existing?.sku || 'SA-LIVE',
          title: item.title,
          category: item.category || existing?.category || 'Atelier Collection',
          catKey: item.catKey || existing?.catKey || 'collection',
          room: item.room || existing?.room,
          woodSpecies: item.woodSpecies || existing?.woodSpecies || 'Solid Hardwood',
          basePriceInr: inr,
          dimensionsCm:
            item.dimensionsCm || existing?.dimensionsCm || { length: 45, width: 45, height: 50 },
          netWeightKg: item.netWeightKg || existing?.netWeightKg || 15,
          stockQuantity: item.stockQuantity ?? existing?.stockQuantity ?? 1,
          isFeatured:
            item.isFeatured !== undefined ? Boolean(item.isFeatured) : (existing?.isFeatured ?? false),
          shortDescription: item.shortDescription || existing?.shortDescription || item.title,
          finishType: item.finishType || existing?.finishType || 'Cold-Pressed Walnut Oil & Beeswax',
          primaryImage: (item as any).primaryImage || existing?.primaryImage,
        };
        map.set(key, normalizedItem);
      }
    }

    return Array.from(map.values());
  }

  /**
   * Helper to format active product catalog context for Gemini
   */
  private static formatCatalogForPrompt(
    products: CachedProduct[],
    currencyCode: string,
    currencySymbol: string,
    conversionRate: number
  ): string {
    return products
      .map((p) => {
        const converted = Math.round(p.basePriceInr / (conversionRate || 84));
        const priceFormatted = `${currencySymbol}${converted.toLocaleString('en-US')} ${currencyCode}`;
        const dims =
          typeof p.dimensionsCm === 'object' && p.dimensionsCm !== null
            ? `${p.dimensionsCm.length ?? 0} × ${p.dimensionsCm.width ?? 0} × ${p.dimensionsCm.height ?? 0} cm`
            : 'Monolithic Proportions';
        return `- [${p.title}](/products/${p.id}) | Room: ${p.room || p.category} | Category: ${p.category} | Species: ${p.woodSpecies} | Dimensions: ${dims} | Price: ${priceFormatted} (${p.basePriceInr} INR) | Link: /products/${p.id}`;
      })
      .join('\n');
  }

  /**
   * TOOL 1: search_catalog
   */
  public static async searchCatalog(
    params: { query?: string; room?: string; category?: string },
    mergedProducts: CachedProduct[],
    currencySymbol: string,
    conversionRate: number,
    currencyCode: string
  ): Promise<{ products: ChatProductItem[]; links: ChatLinkItem[]; summary: string }> {
    const q = (params.query || '').toLowerCase().trim();
    const targetRoom = (params.room || '').toLowerCase().trim();
    const targetCat = (params.category || '').toLowerCase().trim();

    let matched = mergedProducts;

    if (targetRoom) {
      matched = matched.filter((p) => {
        const roomStr = (p.room || '').toLowerCase();
        const catStr = p.category.toLowerCase();
        const titleStr = p.title.toLowerCase();
        if (targetRoom.includes('living')) {
          return (
            roomStr.includes('living') ||
            catStr.includes('urn') ||
            catStr.includes('console') ||
            titleStr.includes('urn') ||
            titleStr.includes('console') ||
            titleStr.includes('armoire')
          );
        }
        if (targetRoom.includes('dining') || targetRoom.includes('kitchen')) {
          return (
            roomStr.includes('dining') ||
            roomStr.includes('kitchen') ||
            catStr.includes('tray') ||
            catStr.includes('board') ||
            catStr.includes('bowl')
          );
        }
        if (targetRoom.includes('balcony') || targetRoom.includes('botanical')) {
          return (
            roomStr.includes('botanical') ||
            roomStr.includes('balcony') ||
            catStr.includes('planter') ||
            catStr.includes('urn')
          );
        }
        if (targetRoom.includes('wall')) {
          return (
            roomStr.includes('wall') ||
            catStr.includes('tile') ||
            titleStr.includes('tile') ||
            titleStr.includes('jharokha')
          );
        }
        return roomStr.includes(targetRoom) || catStr.includes(targetRoom) || titleStr.includes(targetRoom);
      });
    }

    if (targetCat) {
      matched = matched.filter(
        (p) =>
          p.category.toLowerCase().includes(targetCat) ||
          p.catKey.toLowerCase().includes(targetCat) ||
          p.title.toLowerCase().includes(targetCat)
      );
    }

    if (q) {
      const qTokens = q.split(/\s+/).filter((t) => t.length > 2 && !['and', 'for', 'the', 'with', 'show'].includes(t));
      if (qTokens.length > 0) {
        matched = matched.filter((p) => {
          const haystack = `${p.title} ${p.category} ${p.woodSpecies} ${p.room || ''} ${p.shortDescription}`.toLowerCase();
          return qTokens.some((tok) => haystack.includes(tok));
        });
      }
    }

    if (matched.length === 0) {
      matched = mergedProducts.slice(0, 4);
    }

    const products: ChatProductItem[] = matched.slice(0, 6).map((p) => {
      const converted = Math.round(p.basePriceInr / (conversionRate || 84));
      const formatted = `${currencySymbol}${converted.toLocaleString('en-US')}`;
      const dims =
        typeof p.dimensionsCm === 'object' && p.dimensionsCm !== null
          ? `${p.dimensionsCm.length ?? 0} × ${p.dimensionsCm.width ?? 0} × ${p.dimensionsCm.height ?? 0} cm`
          : 'Monolithic Proportions';

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        room: p.room || p.category,
        category: p.category,
        woodSpecies: p.woodSpecies,
        dimensions: dims,
        price: `${formatted} ${currencyCode}`,
        priceInr: p.basePriceInr,
        stockStatus: 'In Stock · Single-Trunk Monolith',
        imageUrl: p.primaryImage || '/logo.jpeg',
        link: `/products/${p.id}`,
      };
    });

    const links: ChatLinkItem[] = products.map((p) => ({
      label: p.title,
      url: p.link,
    }));
    links.push({ label: 'Browse Full Collection', url: '/shop' });

    const summary = products
      .map((p) => `• **[${p.title}](${p.link})** (${p.woodSpecies}) — ${p.price} [${p.dimensions}]`)
      .join('\n');

    return { products, links, summary };
  }

  /**
   * TOOL 2: track_order
   */
  public static async trackOrder(
    orderNumber?: string,
    email?: string,
    isAuthenticated?: boolean
  ): Promise<string> {
    const cleanOrder = (orderNumber || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!isAuthenticated && (!cleanOrder || !cleanEmail)) {
      return (
        'To protect your privacy and retrieve your consignment telemetry, please log in or share both your **Order Number** (e.g. `SC-9842-INTL` or `SIS-ORD-...`) and the **Email Address** used during acquisition.'
      );
    }

    try {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(cleanOrder
              ? [
                  { orderNumber: { equals: cleanOrder, mode: 'insensitive' as const } },
                  { id: cleanOrder },
                  { trackingNumber: { equals: cleanOrder, mode: 'insensitive' as const } },
                ]
              : []),
          ],
          ...(cleanEmail
            ? { customerEmail: { equals: cleanEmail, mode: 'insensitive' as const } }
            : {}),
        },
      });

      if (!order) {
        return (
          `No consignment record found matching reference **${cleanOrder}** with email **${cleanEmail}**. ` +
          `Please double-check your receipt or email Principal Yash Sisodia at \`Sisodiaatelier09@gmail.com\` or WhatsApp \`+91 88680 31460\` for live manifest verification.`
        );
      }

      const stage = order.stage || 1;
      const isLocked = stage >= 5;
      const lockWarning = isLocked
        ? '\n\n🔒 **Consignment Lock Notice**: This piece is out for final doorstep handover and can no longer be cancelled.'
        : '';

      const stageNames: Record<number, string> = {
        1: 'Order Confirmed (Moisture Audit 7.2%)',
        2: 'In Crafting (Nagina Lathe Floor)',
        3: 'Quality & ISPM-15 Cedar Crating',
        4: 'In Transit (International Air Cargo)',
        5: 'Out for Delivery',
        6: 'Delivered (DDP Handover Complete)',
      };

      return (
        `**Live Telemetry for Consignment #${order.orderNumber}**:\n\n` +
        `• **Current Stage**: ${stageNames[stage] || `Stage ${stage} of 6`}\n` +
        `• **Air Freight Carrier**: ${order.courierPartner || 'DHL Express Priority Air Cargo'}\n` +
        `• **Tracking Number**: \`${order.trackingNumber || 'DHL-EXP-PENDING'}\`\n` +
        `• **Active Checkpoint**: ${order.liveCheckpoint || 'Handcrafted & Sealed at Nagina Hub, India'}\n` +
        `• **Destination**: ${order.city}, ${order.countryName}\n` +
        `• **DDP Customs Status**: 100% Pre-Paid ($0 Doorstep Tariffs)${lockWarning}`
      );
    } catch {
      return (
        `Live telemetry record for order **${cleanOrder}**: Handcrafted and sealed in Nagina, India. Pre-cleared for 100% DDP air transit. For real-time courier manifest updates, email Yash Sisodia's export desk at Sisodiaatelier09@gmail.com.`
      );
    }
  }

  /**
   * TOOL 3: submit_custom_or_bulk_inquiry
   */
  public static async submitCustomOrBulkInquiry(data: {
    customerName: string;
    contactInfo: string;
    requirementType?: string;
    details: string;
  }): Promise<string> {
    const { customerName, contactInfo, requirementType, details } = data;
    try {
      await InquiryService.createInquiry({
        customerName: customerName || 'Patron via AI Concierge',
        contactInfo: contactInfo || 'Unspecified',
        requirementType: requirementType || 'Custom Monolithic Woodwork / Tiles',
        quantityOrScope: 'AI Concierge Direct Lead',
        message: details,
      });
      return (
        `Thank you, **${customerName}**. Your bespoke inquiry for **${requirementType || 'Custom Solid Woodwork'}** has been logged directly onto Yash Sisodia's Atelier Desk. Our master team in Nagina will inspect the specifications and follow up at **${contactInfo}** within 24 hours.`
      );
    } catch {
      return (
        `Your bespoke requirements have been noted. Please also email Principal Yash Sisodia directly at Sisodiaatelier09@gmail.com or via WhatsApp at +91 88680 31460 with any architectural drawings or CAD files for priority review.`
      );
    }
  }

  /**
   * Primary Chat Agent Method
   * Every message is processed with Gemini intelligence.
   */
  public static async chat(req: ChatRequest): Promise<ChatResult> {
    const rawMessage = (req.message || '').trim();
    const countryCode = (req.countryCode || 'US').trim().toUpperCase();
    const countryCfg = resolveCountryConfig(countryCode);
    const currencyCode = req.currencyCode || countryCfg.currency;
    const currencySymbol = req.currencySymbol || countryCfg.symbol;
    const conversionRate = req.conversionRate || countryCfg.inrExchangeRate || 84;
    const sessionId = req.sessionId || `session_${Date.now()}`;

    const mergedProducts = await this.getMergedCatalog(req.liveCatalog);
    const providerConfig = LlmProviderService.resolveProviderConfig();

    // 1. Process via Active LLM Provider (.env switch: gemini | claude | openai | groq | openrouter)
    if (providerConfig.apiKey) {
      try {
        const llmResult = await this.invokeLlmAgent(
          rawMessage,
          req,
          mergedProducts,
          countryCode,
          currencyCode,
          currencySymbol,
          conversionRate,
          providerConfig
        );
        if (llmResult && llmResult.reply.trim()) {
          return {
            ...llmResult,
            sessionId,
            timestamp: new Date().toISOString(),
          };
        }
      } catch (llmError: any) {
        logger.warn(`[LLM_AGENT_FALLOVER]: ${llmError?.message || llmError}`);
      }
    }

    // 2. Knowledge-Grounded Intelligent Fallback (Uses full SITE_KNOWLEDGE_BASE)
    const kbResult = await this.runKnowledgeBaseAgent(
      rawMessage,
      req,
      mergedProducts,
      countryCode,
      currencyCode,
      currencySymbol,
      conversionRate
    );

    return {
      ...kbResult,
      sessionId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Invoke Active LLM Provider (Gemini / Claude / OpenAI / Groq / OpenRouter)
   * with Native Tool Calling & Complete Knowledge Base
   */
  private static async invokeLlmAgent(
    userMessage: string,
    req: ChatRequest,
    mergedProducts: CachedProduct[],
    _countryCode: string,
    currencyCode: string,
    currencySymbol: string,
    conversionRate: number,
    providerConfig: { provider: string; apiKey: string; model: string }
  ): Promise<ChatResult | null> {
    const catalogContext = this.formatCatalogForPrompt(
      mergedProducts,
      currencyCode,
      currencySymbol,
      conversionRate
    );

    const siteKnowledgeContext = generateSiteKnowledgePrompt();

    const systemInstruction = `
You are the official AI Concierge of SISODIA ATELIER ✧ in Nagina, India.
Our Principal and Owner is Yash Sisodia. We have been the heart of India's royal woodcraft heritage since 1892.

CRITICAL INSTRUCTIONS & REASONING RULES:
1. UNDERSTAND INTENT & TYPOS: Even if the user writes broken English, spelling mistakes (e.g., "web side", "experties", "quilitys", "instragarm handel", "guid me", "bussinus founder"), or Hinglish (e.g. "apne social media handel do", "mai kaise order kar sakta hu"), understand their true meaning naturally. Never fail on typos.
2. FOUNDER, OWNER & 20+ YEAR GENERATIONAL LEGACY:
   When asked about the founder, owner, history, background, family business, who runs SISODIA ATELIER ✧, or "give the history of this bussinus founder":
   Respond warmly and proudly with our verified story:
   - Principal & Founder: Yash Sisodia
   - Origin: Nagina, India (Globally renowned as India's historic hub of fine woodcraft and single-trunk lathe carving).
   - 20+ Years of Family Craftsmanship & Trust: SISODIA ATELIER ✧ is built upon a distinguished 20-year family handicraft legacy established by Yash Sisodia's father in Nagina. Over the last two decades, his father earned deep trust across Indian families, collectors, and businesses through honest pricing, pure seasoned heartwood, and uncompromised hand-carving standards.
   - Carrying the Legacy Forward Globally: Continuing his father's respected legacy, Yash Sisodia founded and leads SISODIA ATELIER ✧ to bring Nagina's generational woodcraft and architectural solid wooden tiles to discerning homes, architects, and luxury hotels across USA, UK, Europe (Netherlands, Germany, France), Australia, Dubai, Canada, Mexico, and UAE—with 100% pre-paid DDP delivery and direct founder accountability.
   - Direct Founder Desk: Email Sisodiaatelier09@gmail.com | WhatsApp +91 88680 31460.
3. WHY CHOOSE SISODIA ATELIER ✧ / 6 QUALITY PILLARS:
   When asked why choose us, our expertise, qualities, or trust, detail our 6 quality pillars:
   - 100% Monolithic Single-Trunk Heartwood (Burma Teak, Desert Sheesham, Sacred Vijaysar; zero plywood/MDF/veneers)
   - Certified 7.2% Kiln-Dried Moisture Equilibrium (permanently immune to winter radiator splitting in USA/UK/Europe)
   - 100% Chemical-Free Food-Safe Finish (cold-pressed Kashmiri walnut oil and organic desert beeswax; zero polyurethane/lacquer)
   - Architectural Solid Wooden Tiles (Nagina jaali carved modular tiles for luxury walls & floors at /shop?category=tiles)
   - ISPM-15 Certified Cedar Travel Vaults (neoprene dampeners, 3-axis tilt sensors, 100% transit damage replacement insurance)
   - 100% Delivered Duty Paid (DDP Guarantee with $0 doorstep tariffs in all approved export destinations: USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, UAE)
4. SOCIAL MEDIA & OFFICIAL CONTACTS:
   When asked for social media handles (or "insta", "instagram", "linkedin", "whatsapp", "contact", "social media handel"):
   - Instagram: @sisodiaatelier9 (https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0)
   - LinkedIn: Sisodia Atelier (https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android)
   - WhatsApp Direct Desk: +91 88680 31460 (https://wa.me/918868031460)
   - Official Owner / Export Email: Sisodiaatelier09@gmail.com (Principal: Yash Sisodia)
5. PRODUCT & LIST QUERIES:
   When asked for products (e.g., "living room items list with links", "urns", "consoles", "tiles"):
   Return structured bullet points with:
   - Product Name as clickable Markdown link: [Title](/products/<id>)
   - Wood Species
   - Dimensions
   - Exact Price in user's active currency (${currencyCode} ${currencySymbol})
   - Also mention that all pieces include 100% pre-paid DDP delivery ($0 doorstep tariffs) and link [The Masterpiece Collection](/shop).
6. STEP-BY-STEP GUIDANCE:
   - How to order: numbered steps (1. Select country/currency, 2. Choose piece at /shop, 3. Add to Bag, 4. Proceed to DDP Checkout, 5. Pay via Stripe/PayPal/Razorpay, 6. 100% DDP doorstep delivery).
   - How to track: visit /orders or provide Order ID (e.g. SIS-ORD-...) and email.
   - Bulk/Hotel/Trade inquiries: guide to /trade or email Sisodiaatelier09@gmail.com.
7. UNKNOWN / UNSUPPORTED QUERIES (HONEST ESCALATION):
   If asked about things not supported (e.g., delivery to Antarctica, 80% discount, unlisted items):
   Politely clarify what is supported (we ship to USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, UAE under 100% DDP terms; our bespoke heirloom pieces are artisan-made without extreme commercial discounts), and escalate to Principal Yash Sisodia at Sisodiaatelier09@gmail.com and WhatsApp +91 88680 31460 for special considerations.
8. STRICT RULE - ZERO VIDEO CALLS:
   NEVER mention live video calls or video inspections anywhere.

${siteKnowledgeContext}

COMPLETE ACTIVE PRODUCT CATALOG:
${catalogContext}
`.trim();

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'search_catalog',
            description: 'Search Sisodia Atelier handcrafted solid wood pieces and architectural wooden tiles by room, category, or search keywords.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING, description: 'Search term e.g. "urn", "tile", "console", "table", "board"' },
                room: { type: Type.STRING, description: 'Room name e.g. "Living Room", "Kitchen & Dining", "Botanical / Balcony", "Architectural Wall"' },
                category: { type: Type.STRING, description: 'Category e.g. "Urns & Planters", "Carved Trays & Boards", "Bowls & Vessels", "Haveli Consoles", "Solid Wooden Tiles"' },
              },
            },
          },
          {
            name: 'track_order',
            description: 'Track a patron order status and consignment telemetry using order number and patron email.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                orderNumber: { type: Type.STRING, description: 'Order number e.g. "SC-9842-INTL"' },
                email: { type: Type.STRING, description: 'Patron email address' },
              },
            },
          },
          {
            name: 'submit_custom_or_bulk_inquiry',
            description: 'Submit a custom sizing, hotel hospitality, or architectural trade inquiry directly to Principal Yash Sisodia.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                customerName: { type: Type.STRING, description: 'Customer or studio name' },
                contactInfo: { type: Type.STRING, description: 'Email or phone number' },
                requirementType: { type: Type.STRING, description: 'Project scope e.g. Hotel / Bespoke Console' },
                details: { type: Type.STRING, description: 'Project specifications' },
              },
              required: ['customerName', 'contactInfo', 'details'],
            },
          },
        ],
      },
    ];

    const contents: any[] = [];
    const history = (req.conversationHistory || []).slice(-8);

    for (const turn of history) {
      if (!turn.content) continue;
      contents.push({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // If active provider is Gemini, try Gemini with tools first
    if (providerConfig.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: providerConfig.apiKey });
      const customModel = (process.env.AI_MODEL || (env as any).AI_MODEL || '').trim();
      const modelsToTry = customModel
        ? [customModel]
        : ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

      for (const model of modelsToTry) {
        try {
          const round1Promise = ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.3,
              maxOutputTokens: 800,
              tools: tools as any,
            },
          });

          const response1 = (await Promise.race([
            round1Promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout waiting for model ${model}`)), 3000)
            ),
          ])) as any;

          const candidate1 = response1?.candidates?.[0];
          const content1 = candidate1?.content;
          const parts1 = content1?.parts || [];

          // Check if Gemini invoked a tool call
          const functionCallPart = parts1.find((p: any) => p.functionCall);
          if (functionCallPart) {
            const fnName = functionCallPart.functionCall.name;
            const fnArgs = functionCallPart.functionCall.args || {};

            let toolResultData: any = null;
            let toolProducts: ChatProductItem[] = [];
            let toolLinks: ChatLinkItem[] = [];

            if (fnName === 'search_catalog') {
              const res = await this.searchCatalog(
                fnArgs,
                mergedProducts,
                currencySymbol,
                conversionRate,
                currencyCode
              );
              toolResultData = { summary: res.summary, count: res.products.length };
              toolProducts = res.products;
              toolLinks = res.links;
            } else if (fnName === 'track_order') {
              const res = await this.trackOrder(
                fnArgs.orderNumber,
                fnArgs.email,
                req.isAuthenticated
              );
              toolResultData = { status: res };
              toolLinks = [{ label: 'Order Tracking Radar', url: '/orders' }];
            } else if (fnName === 'submit_custom_or_bulk_inquiry') {
              const res = await this.submitCustomOrBulkInquiry(fnArgs);
              toolResultData = { result: res };
              toolLinks = [{ label: 'Trade Program', url: '/trade' }];
            }

            // ROUND 2: Send tool output back to Gemini
            try {
              const round2Contents = [
                ...contents,
                content1,
                {
                  role: 'user',
                  parts: [
                    {
                      functionResponse: {
                        name: fnName,
                        response: { result: toolResultData },
                      },
                    },
                  ],
                },
              ];

              const round2Response = (await Promise.race([
                ai.models.generateContent({
                  model,
                  contents: round2Contents,
                  config: {
                    systemInstruction,
                    temperature: 0.3,
                    maxOutputTokens: 800,
                  },
                }),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Round 2 timeout')), 3000)
                ),
              ])) as any;

              const finalReply = round2Response?.text?.trim() || toolResultData?.summary || toolResultData?.status || toolResultData?.result;
              const extractedLinks = this.extractLinksFromText(finalReply, toolLinks);

              return {
                reply: finalReply,
                products: toolProducts,
                actions: extractedLinks.map((l) => ({ label: l.label, url: l.url })),
                links: extractedLinks,
                toolsUsed: [fnName],
                timestamp: new Date().toISOString(),
              };
            } catch {
              return {
                reply: toolResultData?.summary || toolResultData?.status || toolResultData?.result || 'Action executed successfully.',
                products: toolProducts,
                actions: toolLinks.map((l) => ({ label: l.label, url: l.url })),
                links: toolLinks,
                toolsUsed: [fnName],
                timestamp: new Date().toISOString(),
              };
            }
          }

          const replyText = response1?.text?.trim();
          if (replyText) {
            const extractedLinks = this.extractLinksFromText(replyText, []);
            const matchedProducts = this.extractProductsFromText(replyText, mergedProducts, currencySymbol, conversionRate, currencyCode);

            return {
              reply: replyText,
              products: matchedProducts,
              actions: extractedLinks.map((l) => ({ label: l.label, url: l.url })),
              links: extractedLinks,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (err: any) {
          logger.warn(`Model ${model} attempt error: ${err.message}`);
        }
      }
    }

    // Universal Multi-Provider Fallback (Gemini / Claude / OpenAI / Groq / OpenRouter)
    const providerMessages = contents.map((c) => ({
      role: (c.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      content: c.parts?.[0]?.text || '',
    }));

    const unifiedResult = await LlmProviderService.generateAtelierReply({
      systemInstruction,
      messages: providerMessages,
      temperature: 0.3,
      maxTokens: 800,
    });

    if (unifiedResult && unifiedResult.reply.trim()) {
      const extractedLinks = this.extractLinksFromText(unifiedResult.reply, []);
      const matchedProducts = this.extractProductsFromText(
        unifiedResult.reply,
        mergedProducts,
        currencySymbol,
        conversionRate,
        currencyCode
      );

      return {
        reply: unifiedResult.reply,
        products: matchedProducts,
        actions: extractedLinks.map((l) => ({ label: l.label, url: l.url })),
        links: extractedLinks,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Helper to extract markdown links [label](url) and bare URLs from text
   */
  private static extractLinksFromText(
    text: string,
    existingLinks: ChatLinkItem[]
  ): ChatLinkItem[] {
    const links: ChatLinkItem[] = [...existingLinks];
    const seen = new Set(links.map((l) => l.url));

    const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = mdRegex.exec(text)) !== null) {
      const label = match[1];
      const url = match[2];
      if (!seen.has(url)) {
        links.push({ label, url });
        seen.add(url);
      }
    }

    // Default shop link if no links present
    if (links.length === 0) {
      links.push({ label: 'Browse All Masterworks', url: '/shop' });
    }

    return links;
  }

  /**
   * Helper to find products mentioned in text and format them for cards
   */
  private static extractProductsFromText(
    text: string,
    products: CachedProduct[],
    currencySymbol: string,
    conversionRate: number,
    currencyCode: string
  ): ChatProductItem[] {
    const matched: ChatProductItem[] = [];
    const lower = text.toLowerCase();

    for (const p of products) {
      if (lower.includes(p.id.toLowerCase()) || lower.includes(p.title.toLowerCase())) {
        const converted = Math.round(p.basePriceInr / (conversionRate || 84));
        const formatted = `${currencySymbol}${converted.toLocaleString('en-US')}`;
        const dims =
          typeof p.dimensionsCm === 'object' && p.dimensionsCm !== null
            ? `${p.dimensionsCm.length ?? 0} × ${p.dimensionsCm.width ?? 0} × ${p.dimensionsCm.height ?? 0} cm`
            : 'Monolithic Proportions';

        matched.push({
          id: p.id,
          slug: p.slug,
          title: p.title,
          room: p.room || p.category,
          category: p.category,
          woodSpecies: p.woodSpecies,
          dimensions: dims,
          price: `${formatted} ${currencyCode}`,
          priceInr: p.basePriceInr,
          stockStatus: 'In Stock · Single-Trunk Monolith',
          imageUrl: p.primaryImage || '/logo.jpeg',
          link: `/products/${p.id}`,
        });
        if (matched.length >= 4) break;
      }
    }

    return matched;
  }

  /**
   * Knowledge-Base Reasoning Agent (Handles all queries intelligently using full SITE_KNOWLEDGE_BASE)
   * NO dumb generic fallback strings!
   */
  private static async runKnowledgeBaseAgent(
    userMessage: string,
    _req: ChatRequest,
    mergedProducts: CachedProduct[],
    countryCode: string,
    currencyCode: string,
    currencySymbol: string,
    conversionRate: number
  ): Promise<ChatResult> {
    const q = userMessage.toLowerCase().trim();
    const isHindi = /kaise|karein|karna|karo|chahiye|kitna|bataye|bhai|mera|meri|mujhe|hum|mai|kya|hai|kab|apne|dikhaye/.test(q);

    // 0. FOUNDER, OWNER, HISTORY & 20+ YEAR GENERATIONAL LEGACY
    // Matches: "founder", "owner", "history", "bussinus", "business", "who runs", "who started", "who is", "family", "father", "background", "story", "legacy"
    const isFounderQuery =
      q.includes('founder') ||
      q.includes('owner') ||
      q.includes('history') ||
      q.includes('bussinus') ||
      q.includes('business') ||
      q.includes('father') ||
      q.includes('family') ||
      q.includes('legacy') ||
      q.includes('who runs') ||
      q.includes('who started') ||
      q.includes('background') ||
      q.includes('malik') ||
      q.includes('kiska') ||
      q.includes('pitaji');

    if (isFounderQuery) {
      const reply = isHindi
        ? `**SISODIA ATELIER ✧** ki shuruat aur generational legacy Nagina ke pavitra woodcraft itihas se judi hai:\n\n` +
          `• **Principal & Founder**: **Yash Sisodia**\n` +
          `• **Originated in Nagina**: Nagina sadiyon se fine artisan lathe turning aur single-trunk wood carving ka vishwaprasiddh hub hai.\n` +
          `• **20+ Saal Ka Parivarik Vishwas Aur Karigari**: SISODIA ATELIER ✧ **Yash Sisodia ke pitaji** dwara Nagina mein sthapit **20 saal ki atoot parivarik handicraft dharohar** par tika hai. Pichhle do dashakon mein unke pitaji ne imandaar pricing, authentic seasoned heartwood aur behtareen hand-carving standards ke bal par pure Bharat ke parivaron, collectors aur businesses ka gehra vishwas kamaya.\n` +
          `• **Dharohar Ko Global Paimane Par Aage Badhana**: Apne pitaji ki is pratishthit legacy ko garv se aage badhate hue, **Yash Sisodia** ne **SISODIA ATELIER ✧** ki sthapna ki aur iska netritva kar rahe hain—taaki Nagina ke generational solid wood heirlooms aur architectural wooden tiles ko **USA, UK, Europe (Netherlands, Germany, France), Australia, Dubai, Canada, Mexico, aur UAE** ke luxury homes aur hotels tak 100% pre-paid DDP delivery ($0 doorstep tariffs) ke sath pahunchaya ja sake.\n\n` +
          `• **Direct Founder Desk**:\n` +
          `  - **Email**: [Sisodiaatelier09@gmail.com](mailto:Sisodiaatelier09@gmail.com)\n` +
          `  - **WhatsApp Direct**: [+91 88680 31460](https://wa.me/918868031460)\n\n` +
          `Hamari generational collection ko dekhne ke liye visit karein **[The Masterpiece Collection](/shop)** ya B2B architectural requirements ke liye **[The Trade Portal](/trade)**.`
        : `**SISODIA ATELIER ✧** is rooted in a rich generational tradition of fine timber craft in Nagina, India:\n\n` +
          `• **Principal & Founder**: **Yash Sisodia**\n` +
          `• **Origin**: **Nagina, India** — globally celebrated as India's historic capital of master lathe-turning and single-trunk wood carving.\n` +
          `• **20+ Years of Family Craftsmanship & Trust**: SISODIA ATELIER ✧ is built upon a distinguished **20-year family handicraft legacy** established by **Yash Sisodia's father** in Nagina. Over the last two decades, his father earned deep trust across Indian families, collectors, and architectural estates through honest pricing, pure seasoned heartwood, and uncompromising hand-carving standards.\n` +
          `• **Carrying the Legacy Forward Globally**: Continuing his father's respected legacy, **Yash Sisodia** founded and leads **SISODIA ATELIER ✧** to bring Nagina's generational woodcraft and architectural solid wooden tiles to discerning homes, architects, and luxury estates across **USA, UK, Europe (Netherlands, Germany, France), Australia, Dubai, Canada, Mexico, and UAE**—with 100% pre-paid DDP delivery ($0 doorstep tariffs) and direct founder accountability.\n\n` +
          `• **Direct Founder Desk**:\n` +
          `  - **Email**: [Sisodiaatelier09@gmail.com](mailto:Sisodiaatelier09@gmail.com)\n` +
          `  - **WhatsApp Direct**: [+91 88680 31460](https://wa.me/918868031460)\n\n` +
          `Explore our generational collection at **[The Masterpiece Collection](/shop)** or view our architectural capabilities at **[The Trade Portal](/trade)**.`;

      const actions: ChatActionButton[] = [
        { label: 'WhatsApp Yash Sisodia', url: 'https://wa.me/918868031460' },
        { label: 'The Masterpiece Collection', url: '/shop' },
        { label: 'Trade & Hospitality Desk', url: '/trade' },
      ];

      return {
        reply,
        products: [],
        actions,
        links: actions,
        toolsUsed: ['get_founder_and_legacy_profile'],
        timestamp: new Date().toISOString(),
      };
    }

    // 1. SOCIAL MEDIA & CONTACTS
    // Matches: "social media", "social media handel", "insta", "instagram", "linkedin", "whatsapp", "contact"
    const isSocialQuery =
      q.includes('social') ||
      q.includes('handel') ||
      q.includes('handle') ||
      q.includes('insta') ||
      q.includes('linkedin') ||
      q.includes('whatsapp') ||
      q.includes('phone') ||
      q.includes('email');

    if (isSocialQuery) {
      const reply = isHindi
        ? `Aap **SISODIA ATELIER ✧** aur Principal **Yash Sisodia** se niche diye gaye official channels par jud sakte hain:\n\n` +
          `• **Instagram**: [\`@sisodiaatelier9\`](https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0) — Daily atelier showreels, timber seasoning, and live polish updates\n` +
          `• **LinkedIn**: [\`Sisodia Atelier\`](https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android) — B2B hospitality, architectural collaborations & export logistics\n` +
          `• **WhatsApp Direct Desk**: [\`+91 88680 31460\`](https://wa.me/918868031460) — Direct artisan consultation & custom dimension requests\n` +
          `• **Official Export Email**: [\`Sisodiaatelier09@gmail.com\`](mailto:Sisodiaatelier09@gmail.com) — Principal Yash Sisodia's export desk`
        : `Here are the verified official social media handles and direct contact channels for **SISODIA ATELIER ✧** (Principal: Yash Sisodia, Nagina, India):\n\n` +
          `• **Instagram**: [\`@sisodiaatelier9\`](https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0) — Daily masterwork reels, lathe turning, and walnut oil finish stories\n` +
          `• **LinkedIn**: [\`Sisodia Atelier\`](https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android) — B2B hotel contracts, architect collaborations and overseas logistics\n` +
          `• **WhatsApp Direct Desk**: [\`+91 88680 31460\`](https://wa.me/918868031460) — Instant artisan desk for bespoke sizing & custom quotes\n` +
          `• **Official Export Email**: [\`Sisodiaatelier09@gmail.com\`](mailto:Sisodiaatelier09@gmail.com) — Yash Sisodia's direct export desk`;

      const actions: ChatActionButton[] = [
        { label: 'Instagram Profile', url: 'https://www.instagram.com/sisodiaatelier9?utm_source=qr&mdxt=ZzZmMDVjd2Fvb3V0' },
        { label: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/sisodia-atelier-588945449?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
        { label: 'WhatsApp Yash Sisodia', url: 'https://wa.me/918868031460' },
        { label: 'Browse Collection', url: '/shop' },
      ];

      return {
        reply,
        products: [],
        actions,
        links: actions,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. WHY CHOOSE SISODIA ATELIER / EXPERTISE / QUALITIES / TRUST
    // Matches: "why i can choose your web side define you experties or quilitys", "why choose", "expertise", "quality", "trust"
    const isQualityQuery =
      q.includes('choose') ||
      q.includes('experties') ||
      q.includes('expertise') ||
      q.includes('quility') ||
      q.includes('quality') ||
      q.includes('trust') ||
      q.includes('why should') ||
      q.includes('authentic') ||
      q.includes('bharosa') ||
      q.includes('khasiyat');

    if (isQualityQuery) {
      const reply = isHindi
        ? `Patrons aur architectural collectors **SISODIA ATELIER ✧** (Nagina, India) par isliye vishwas karte hain kyunki hum bina kisi commercial samjhaute ke solid wood heirlooms banate hain:\n\n` +
          `1. **100% Monolithic Single-Trunk Heartwood**: Har piece bina kisi jod (joint) ke singular solid tree trunk se lathe par turn ya hand-carve kiya jata hai. Zero plywood, zero MDF, zero chemical veneer.\n` +
          `2. **7.2% Certified Kiln-Dried Equilibrium**: Scientific solar wind kilning se wood ko 7.2% moisture equilibrium par laya jata hai—jis se ye USA, UK aur Europe ke winter heating radiators ke paas bhi kabhi crack ya split nahi hota.\n` +
          `3. **100% Chemical-Free Food-Safe Finish**: Toxic polyurethane spray ke bajaye ise cold-pressed Kashmiri walnut oil aur organic desert beeswax se hand-burnish kiya jata hai.\n` +
          `4. **Architectural Solid Wooden Tiles**: Signature Nagina jaali modular solid wood tiles luxury walls aur floors ke liye available hain ([Explore Tiles](/shop)).\n` +
          `5. **ISPM-15 Certified Cedar Travel Vaults**: Shock-isolated custom cedar cases with 3-axis electronic tilt sensors aur 100% transit damage replacement insurance.\n` +
          `6. **100% Delivered Duty Paid (DDP Guarantee)**: Har overseas consignment ke customs aur import duties pre-paid hote hain ($0 doorstep tariffs).\n\n` +
          `Hamari purn collection ko explore karne ke liye visit karein **[Browse All Masterworks](/shop)**.`
        : `Patrons, architects, and luxury estate collectors choose **SISODIA ATELIER ✧** (Nagina, India — Principal: Yash Sisodia) for our unyielding craftsmanship and 6 foundational pillars:\n\n` +
          `1. **100% Monolithic Single-Trunk Heartwood**: Every urn, console, and vessel is sculpted from a singular unjoined block of aged Burma Teak, Sacred Ayurvedic Vijaysar, or Desert Sheesham. Zero plywood, zero MDF, zero glued veneers.\n` +
          `2. **7.2% Certified Kiln-Dried Equilibrium**: Cured down to 7.2% equilibrium, making the timber scientifically immune to cracking, checking, or warping even beside intense winter radiator heating across North America and Europe.\n` +
          `3. **100% Chemical-Free Food-Safe Finishing**: Exclusively hand-burnished with cold-pressed Kashmiri walnut oil and organic desert beeswax (0 toxic polyurethane or synthetic varnishes).\n` +
          `4. **Architectural Solid Wooden Tiles**: Signature Nagina hand-carved modular tiles and jaali acoustic panels for luxury walls and floors ([View Architectural Tiles](/shop)).\n` +
          `5. **ISPM-15 Fumigated Cedar Travel Vaults**: Custom heat-treated cedar crates with neoprene shock dampeners, 3-axis tilt sensors, and 100% transit replacement insurance.\n` +
          `6. **100% Delivered Duty Paid (DDP Guarantee)**: Pre-cleared foreign customs and **$0 doorstep import taxes** for USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE.\n\n` +
          `Explore our complete collection at **[The Masterpiece Collection](/shop)** or inquire for bespoke architectural woodwork at **[Bulk/Trade](/trade)**.`;

      const actions: ChatActionButton[] = [
        { label: 'Browse Masterpieces', url: '/shop' },
        { label: 'Hotel & Trade Program', url: '/trade' },
      ];

      return {
        reply,
        products: [],
        actions,
        links: actions,
        toolsUsed: ['get_trust_and_shipping_details'],
        timestamp: new Date().toISOString(),
      };
    }

    // 3. PRODUCT / ROOM CATALOG SEARCH ("living room items list with links", etc.)
    const roomKeywords = [
      { key: 'living', room: 'Living Room' },
      { key: 'dining', room: 'Kitchen & Dining' },
      { key: 'kitchen', room: 'Kitchen & Dining' },
      { key: 'balcony', room: 'Botanical / Balcony' },
      { key: 'botanical', room: 'Botanical / Balcony' },
      { key: 'wall', room: 'Architectural Wall' },
    ];
    const categoryKeywords = [
      { key: 'tile', cat: 'Solid Wooden Tiles' },
      { key: 'urn', cat: 'Urns & Planters' },
      { key: 'console', cat: 'Haveli Consoles' },
      { key: 'tray', cat: 'Carved Trays & Boards' },
      { key: 'board', cat: 'Carved Trays & Boards' },
      { key: 'bowl', cat: 'Bowls & Vessels' },
      { key: 'basin', cat: 'Bowls & Vessels' },
      { key: 'armoire', cat: 'Haveli Consoles' },
    ];

    const matchedRoom = roomKeywords.find((r) => q.includes(r.key));
    const matchedCat = categoryKeywords.find((c) => q.includes(c.key));

    const isCatalogQuery =
      matchedRoom ||
      matchedCat ||
      q.includes('item') ||
      q.includes('list') ||
      q.includes('product') ||
      q.includes('show') ||
      q.includes('catalog') ||
      q.includes('price');

    if (isCatalogQuery) {
      const searchRes = await this.searchCatalog(
        {
          room: matchedRoom ? matchedRoom.room : undefined,
          category: matchedCat ? matchedCat.cat : undefined,
          query: !matchedRoom && !matchedCat ? q : undefined,
        },
        mergedProducts,
        currencySymbol,
        conversionRate,
        currencyCode
      );

      const sectionTitle = matchedRoom?.room || matchedCat?.cat || 'Our Handcrafted Masterworks';
      const intro = isHindi
        ? `Nagina atelier se **${sectionTitle}** ke verified solid wood pieces direct links ke sath niche diye gaye hain:\n\n`
        : `Here are our verified solid wood pieces from the Nagina atelier for **${sectionTitle}**:\n\n`;

      const outro =
        `\n\nAll orders include 100% pre-paid DDP doorstep delivery to **${resolveCountryConfig(countryCode).countryName}** ($0 doorstep tariffs). Explore our complete collection at **[The Masterpiece Collection](/shop)**.`;

      const reply = `${intro}${searchRes.summary}${outro}`;

      return {
        reply,
        products: searchRes.products,
        actions: searchRes.links.map((l) => ({ label: l.label, url: l.url })),
        links: searchRes.links,
        toolsUsed: ['search_catalog'],
        timestamp: new Date().toISOString(),
      };
    }

    // 4. UNKNOWN / UNSUPPORTED / OUT-OF-SCOPE (e.g. Antarctica, 80% discount)
    // Matches: "antarctica", "discount", "80%", etc.
    const isUnsupported =
      q.includes('antarctica') ||
      q.includes('80%') ||
      q.includes('70%') ||
      q.includes('free delivery to moon') ||
      q.includes('cheap');

    if (isUnsupported) {
      const reply =
        `SISODIA ATELIER ✧ ships exclusively under 100% Delivered Duty Paid (DDP) terms to our approved destinations: **USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, and UAE**.\n\n` +
        `• **Service Limitations**: We do not currently service unlisted territories like Antarctica.\n` +
        `• **Heirloom Value & Pricing**: Because each masterwork is lathe-turned or hand-chiseled from single-trunk timber seasoned up to 16 years, we maintain fair artisanal pricing and do not offer mass commercial discounts (such as 80%).\n` +
        `• **Hospitality & Volume Inquiries**: For large hotel architectural consignments (20ft/40ft containers), please visit our **[Trade Portal](/trade)** or contact Principal **Yash Sisodia** directly:\n` +
        `  - **Email**: [\`Sisodiaatelier09@gmail.com\`](mailto:Sisodiaatelier09@gmail.com)\n` +
        `  - **WhatsApp Direct**: [\`+91 88680 31460\`](https://wa.me/918868031460)`;

      const actions: ChatActionButton[] = [
        { label: 'Explore Trade Program', url: '/trade' },
        { label: 'Browse Collection', url: '/shop' },
      ];

      return {
        reply,
        products: [],
        actions,
        links: actions,
        timestamp: new Date().toISOString(),
      };
    }

    // 5. STEP-BY-STEP ORDERING INSTRUCTIONS
    const isOrderingHelp =
      (q.includes('order') || q.includes('buy') || q.includes('kharid')) &&
      (q.includes('how') || q.includes('guid') || q.includes('step') || q.includes('kaise') || q.includes('tarika') || q.includes('process'));

    if (isOrderingHelp) {
      const reply =
        `Acquiring an authentic solid wood masterwork from **SISODIA ATELIER ✧** is straightforward and secure:\n\n` +
        `1. **Select Region & Currency**: In the top navigation bar, select ${countryCode} to view prices in ${currencyCode} (${currencySymbol}).\n` +
        `2. **Choose Your Piece**: Explore our collection at **[The Masterpiece Collection](/shop)** or view our featured masterworks.\n` +
        `3. **Add to Bag**: On the piece's page, click **"Add Solid Heartwood Piece to Bag"**.\n` +
        `4. **Proceed to DDP Checkout**: Open your Acquisition Bag (top right) and click **"Proceed to DDP Checkout"**.\n` +
        `5. **Secure Payment**: Pay securely via Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay), PayPal, or Razorpay for India.\n` +
        `6. **Doorstep Handover**: Your shipment travels in an ISPM-15 fumigated cedar vault with $0 doorstep customs tariffs guaranteed.`;

      const actions: ChatActionButton[] = [
        { label: 'Browse All Masterworks', url: '/shop' },
        { label: 'Hotel & Trade Program', url: '/trade' },
      ];

      return {
        reply,
        products: [],
        actions,
        links: actions,
        timestamp: new Date().toISOString(),
      };
    }

    // 6. DEFAULT POLITE ESCALATION (Honest, respectful, points to Yash Sisodia)
    const reply =
      `I am SISODIA ATELIER ✧'s AI Concierge in Nagina (India). You can explore our handcrafted single-trunk pieces at **[The Masterpiece Collection](/shop)**, review our **[Trade Program](/trade)**, or check an active shipment at **[Order Tracking](/orders)**.\n\n` +
      `For tailored architectural dimensions or specific inquiries, Principal **Yash Sisodia** is available directly at [\`Sisodiaatelier09@gmail.com\`](mailto:Sisodiaatelier09@gmail.com) or WhatsApp [\`+91 88680 31460\`](https://wa.me/918868031460). How may I assist your space today?`;

    const actions: ChatActionButton[] = [
      { label: 'Browse Collection', url: '/shop' },
      { label: 'WhatsApp Yash Sisodia', url: 'https://wa.me/918868031460' },
    ];

    return {
      reply,
      products: [],
      actions,
      links: actions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Typed SSE Stream Method
   */
  public static async streamChat(
    req: ChatRequest,
    sendEvent: (event: string, data: any) => void
  ): Promise<void> {
    const result = await this.chat(req);

    const words = result.reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      const delta = i === words.length - 1 ? words[i] : `${words[i]} `;
      sendEvent('text', { delta });
      if (words.length > 10 && i % 4 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    if (result.products && result.products.length > 0) {
      sendEvent('products', { items: result.products });
    }

    if (result.actions && result.actions.length > 0) {
      sendEvent('action', { buttons: result.actions });
    }

    if (result.toolsUsed && result.toolsUsed.length > 0) {
      sendEvent('tools', { tools: result.toolsUsed });
    }
  }

  /**
   * Backward-compatible askCraftsman alias
   */
  public static async askCraftsman(
    message: string,
    conversationHistory: ChatMessage[] = [],
    countryCode: string = 'US',
    extraOptions?: {
      currencyCode?: string;
      currencySymbol?: string;
      conversionRate?: number;
      liveCatalog?: LiveProductInput[];
    }
  ): Promise<{ reply: string; ustad: string; atelierLocation: string; products: ChatProductItem[]; links: ChatLinkItem[] }> {
    const result = await this.chat({
      message,
      countryCode,
      currencyCode: extraOptions?.currencyCode,
      currencySymbol: extraOptions?.currencySymbol,
      conversionRate: extraOptions?.conversionRate,
      conversationHistory,
      liveCatalog: extraOptions?.liveCatalog,
    });

    return {
      reply: result.reply,
      products: result.products,
      links: result.links,
      ustad: 'SISODIA ATELIER ✧ AI Concierge',
      atelierLocation: 'SISODIA ATELIER ✧, Nagina Woodcraft Hub, India',
    };
  }
}

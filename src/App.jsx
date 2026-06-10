import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CATEGORY_WEIGHTS = { Structure: 0.30, Character: 0.30, Writing: 0.25, Technical: 0.15 };

const SUBCATEGORIES = {
  Structure: [
    { key: "plot",       label: "Plot",               weight: 0.25 },
    { key: "climax",     label: "Climax/Peaks",        weight: 0.25 },
    { key: "pacing",     label: "Pacing/Consistency",  weight: 0.20 },
    { key: "conclusion", label: "Conclusion",          weight: 0.20 },
    { key: "intro",      label: "Intro",               weight: 0.10 },
  ],
  Character: [
    { key: "protagonist",   label: "Protagonist",      weight: 0.25 },
    { key: "antagonists",   label: "Antagonists",      weight: 0.20 },
    { key: "maincast",      label: "Main Cast",        weight: 0.20 },
    { key: "deuteragonist", label: "Deuteragonist(s)", weight: 0.12 },
    { key: "dynamics",      label: "Dynamics",         weight: 0.08 },
    { key: "development",   label: "Development",      weight: 0.08 },
    { key: "sidecast",      label: "Side Cast",        weight: 0.07 },
  ],
  Writing: [
    { key: "themes",    label: "Themes/Philosophy",  weight: 0.30 },
    { key: "emotion",   label: "Emotion",            weight: 0.30 },
    { key: "cohesion",  label: "Narrative Cohesion", weight: 0.18 },
    { key: "dialogue",  label: "Dialogue/Monologue", weight: 0.14 },
    { key: "symbolism", label: "Symbolism",          weight: 0.08 },
  ],
  Technical: [
    { key: "visuals",    label: "Visuals",           weight: 0.28 },
    { key: "direction",  label: "Direction/Framing", weight: 0.26 },
    { key: "fights",     label: "Fights/Action",     weight: 0.15 },
    { key: "worldbuild", label: "Worldbuilding",     weight: 0.12 },
    { key: "music",      label: "Music/Sound",       weight: 0.10 },
    { key: "chardesign", label: "Character Design",  weight: 0.09 },
  ],
};

// ─── ARC CONFIG ───────────────────────────────────────────────────────────────
const ARC_CATEGORY_WEIGHTS = { Structure: 0.30, Character: 0.25, Writing: 0.30, Technical: 0.15 };

const ARC_SUBCATEGORIES = {
  Structure: [
    { key: "plot",       label: "Plot",               weight: 0.25 },
    { key: "climax",     label: "Climax/Peaks",        weight: 0.25 },
    { key: "pacing",     label: "Pacing/Consistency",  weight: 0.20 },
    { key: "conclusion", label: "Conclusion",          weight: 0.20 },
    { key: "intro",      label: "Intro",               weight: 0.10 },
  ],
  Character: [
    { key: "protagonist",   label: "Protagonist",      weight: 0.25 },
    { key: "antagonists",   label: "Antagonists",      weight: 0.20 },
    { key: "maincast",      label: "Main Cast",        weight: 0.20 },
    { key: "deuteragonist", label: "Deuteragonist(s)", weight: 0.12 },
    { key: "dynamics",      label: "Dynamics",         weight: 0.08 },
    { key: "development",   label: "Development",      weight: 0.08 },
    { key: "sidecast",      label: "Side Cast",        weight: 0.07 },
  ],
  Writing: [
    { key: "themes",      label: "Themes/Philosophy",    weight: 0.30 },
    { key: "emotion",     label: "Emotion",              weight: 0.30 },
    { key: "cohesion",    label: "Arc Cohesion",         weight: 0.18 },
    { key: "significance",label: "Narrative Significance",weight: 0.12 },
    { key: "dialogue",    label: "Dialogue/Monologue",   weight: 0.10 },
  ],
  Technical: [
    { key: "visuals",    label: "Visuals",           weight: 0.28 },
    { key: "direction",  label: "Direction/Framing", weight: 0.26 },
    { key: "fights",     label: "Fights/Action",     weight: 0.15 },
    { key: "worldbuild", label: "Worldbuilding",     weight: 0.12 },
    { key: "music",      label: "Music/Sound",       weight: 0.10 },
    { key: "chardesign", label: "Character Design",  weight: 0.09 },
  ],
};

const ARC_CATEGORIES = Object.keys(ARC_SUBCATEGORIES);

// Arc-specific anchor overrides — replaces series anchors where language doesn't apply
const ARC_ANCHOR_OVERRIDES = {
  Structure: {
    plot: [
      { range: "18-20", desc: "A masterfully constructed arc — setup, escalation, and resolution flow with complete intentionality. Every scene serves the arc's central conflict and nothing feels wasted or out of place" },
      { range: "14-17", desc: "A well-structured arc with clear progression and only minor pacing stumbles or scenes that don't fully earn their place" },
      { range: "10-13", desc: "A competent arc structure that gets from A to B effectively but with noticeable slack, padding, or underdeveloped threads" },
      { range: "6-9",   desc: "Structural problems that damage the arc — scenes that go nowhere, a central conflict that isn't clearly established, or a narrative that loses its thread mid-arc" },
      { range: "0-5",   desc: "No coherent arc structure — the narrative is directionless, contradictory, or so poorly constructed it damages the broader series" },
    ],
    climax: [
      { range: "18-20", desc: "A climactic moment that defines not just the arc but potentially the entire series — emotionally, thematically, and narratively irreplaceable. Impossible to imagine the work without it" },
      { range: "14-17", desc: "An exceptional peak that delivers fully on its buildup — the arc is defined by this moment and it lingers long after" },
      { range: "10-13", desc: "A solid climax that lands without transcending — satisfying but not the kind of moment you return to mentally" },
      { range: "6-9",   desc: "A climax that underdelivers relative to its setup, or an arc where the peak moment feels accidental rather than earned" },
      { range: "0-5",   desc: "No meaningful climax, or a peak moment so poorly executed it deflates everything that preceded it" },
    ],
    pacing: [
      { range: "18-20", desc: "Nearly flawless arc pacing — every chapter or episode breathes at exactly the right speed. No scenes overstay their welcome, no transitions feel rushed, tone is maintained throughout" },
      { range: "14-17", desc: "Consistently well-paced with minor stumbles — the arc's rhythm serves its story without significantly disrupting immersion" },
      { range: "10-13", desc: "Uneven pacing — stretches of excellent momentum undermined by bloated scenes, rushed resolutions, or tonal inconsistencies" },
      { range: "6-9",   desc: "Persistent pacing issues that damage the arc — either chronically slow without purpose or so rushed that emotional beats don't land" },
      { range: "0-5",   desc: "Pacing so poor it makes the arc fundamentally difficult to engage with" },
    ],
    conclusion: [
      { range: "18-20", desc: "A perfect arc ending — thematically earned, emotionally resonant, and resolving every thread it opened. Leaves the series meaningfully changed" },
      { range: "14-17", desc: "A strong conclusion that satisfies the arc's central conflict even if minor threads remain open or slightly underresolved" },
      { range: "10-13", desc: "A functional arc ending that closes the immediate conflict without particularly resonating or elevating what came before" },
      { range: "6-9",   desc: "A weak ending that undermines the arc — rushed, unearned, or resolving the central conflict in a way that feels hollow" },
      { range: "0-5",   desc: "An ending so poor it damages not just the arc but retroactively undermines the series around it" },
      { range: "N/A",   desc: "Ongoing arcs without a conclusion yet — set applicability to 0" },
    ],
    intro: [
      { range: "18-20", desc: "An arc opening that immediately establishes its unique tone, central conflict, and stakes — compelling entirely on its own terms and setting a standard the arc then meets" },
      { range: "14-17", desc: "A strong arc opening that hooks effectively, establishes what's at stake, and distinguishes this arc from what surrounds it" },
      { range: "10-13", desc: "A functional intro that establishes the arc's conflict without being particularly memorable or distinctive" },
      { range: "6-9",   desc: "A slow or tonally inconsistent opening that undersells the arc or sets wrong expectations for what follows" },
      { range: "0-5",   desc: "An opening so poor it creates a barrier to engaging with the arc at all" },
    ],
  },
  Character: {
    protagonist: [
      { range: "18-20", desc: "The protagonist's role within this arc is among the finest character work in the medium — their choices, growth, or crisis within the arc are thematically essential and emotionally irreplaceable" },
      { range: "14-17", desc: "Exceptional protagonist work within the arc — their presence elevates every scene and their arc-specific journey is compelling and well-executed" },
      { range: "10-13", desc: "A solid protagonist performance within the arc — they serve the story well without this specific arc being a defining chapter for the character" },
      { range: "6-9",   desc: "The protagonist feels passive, inconsistent, or underutilized within the arc relative to what the story demands of them" },
      { range: "0-5",   desc: "The protagonist actively undermines the arc through poor writing, inconsistent characterization, or narrative irrelevance" },
    ],
    antagonists: [
      { range: "18-20", desc: "The arc's antagonist(s) are among the finest in the medium — their ideology, presence, and role within the arc reframe the entire conflict and make the arc inseparable from their existence" },
      { range: "14-17", desc: "Genuinely threatening and well-realized antagonist(s) with clear motivation and meaningful narrative weight within the arc" },
      { range: "10-13", desc: "Solid antagonist(s) who fulfill their role effectively without being particularly complex or memorable" },
      { range: "6-9",   desc: "Antagonist(s) who exist primarily as obstacles — motivation is thin and their presence is functional at best" },
      { range: "0-5",   desc: "Antagonist(s) so poorly realized they damage the arc's stakes and credibility" },
    ],
    maincast: [
      { range: "18-20", desc: "The arc's main cast is essential — each member carries genuine narrative weight within the arc, and removing any one would collapse something important in the story being told" },
      { range: "14-17", desc: "A strong main cast contribution with distinct roles and meaningful involvement — the arc is clearly richer for how it uses them" },
      { range: "10-13", desc: "The main cast functions adequately within the arc without any member being particularly essential or deeply characterized" },
      { range: "6-9",   desc: "The main cast feels peripheral or interchangeable within the arc — present but not meaningfully deployed" },
      { range: "0-5",   desc: "The main cast's role in the arc actively undermines it through poor writing or wasted potential" },
    ],
    deuteragonist: [
      { range: "18-20", desc: "The deuteragonist's arc within this story is as essential as the protagonist's — their relationship and parallel journey define the arc's emotional core" },
      { range: "14-17", desc: "A compelling deuteragonist presence within the arc — they carry independent narrative weight and their dynamic with the protagonist drives key moments" },
      { range: "10-13", desc: "A solid deuteragonist contribution that enhances the arc without carrying fully independent narrative weight" },
      { range: "6-9",   desc: "The deuteragonist feels subordinate or underutilized within the arc relative to their established importance" },
      { range: "0-5",   desc: "The deuteragonist has no meaningful arc-specific presence or purpose" },
      { range: "N/A",   desc: "Arcs without a clear deuteragonist — set applicability accordingly" },
    ],
    dynamics: [
      { range: "18-20", desc: "The relationships within this arc carry its full thematic weight — interactions between characters recontextualize both parties and feel genuinely irreplaceable to what the arc is trying to say" },
      { range: "14-17", desc: "Deeply compelling dynamics with real tension, chemistry, or emotional resonance that define the arc's most memorable moments" },
      { range: "10-13", desc: "Solid character interactions that work within the arc without being particularly distinctive or thematically charged" },
      { range: "6-9",   desc: "Character dynamics within the arc feel mechanical or underdeveloped — relationships that exist by necessity rather than by design" },
      { range: "0-5",   desc: "Dynamics so poorly written they feel false or actively damage the characters involved" },
    ],
    development: [
      { range: "18-20", desc: "The character transformation within this arc is so complete and earned it could stand alone as a full arc of growth — every step is justified by what came before within the arc itself" },
      { range: "14-17", desc: "Meaningful, well-paced development that genuinely transforms at least one character in ways that matter to the arc and series" },
      { range: "10-13", desc: "Noticeable development that lands but lacks the depth or consistency to be truly resonant at arc level" },
      { range: "6-9",   desc: "Surface-level or rushed development — change happens but feels unearned given the arc's runtime" },
      { range: "0-5",   desc: "No meaningful development, or character regression so poorly handled it damages the work" },
      { range: "N/A",   desc: "Transitional arcs where development is minimal by design — set applicability accordingly" },
    ],
    sidecast: [
      { range: "18-20", desc: "Even peripheral characters within the arc feel fully realized — collectively they expand the world and make the arc feel inhabited beyond its central cast" },
      { range: "14-17", desc: "Strong supporting presence with several characters who meaningfully contribute to the arc's atmosphere or plot" },
      { range: "10-13", desc: "A functional side presence that serves the arc without being particularly memorable" },
      { range: "6-9",   desc: "Thin supporting characters who exist as plot devices or background without contributing meaningfully" },
      { range: "0-5",   desc: "A side cast so underdeveloped it makes the arc's world feel hollow" },
    ],
  },
};

const CATEGORIES = Object.keys(SUBCATEGORIES);
const ALL_SUBCATS = CATEGORIES.flatMap(cat => SUBCATEGORIES[cat].map(s => ({ ...s, cat })));
const COMPLETION_STATUSES = ["Completed","Ongoing","Hiatus","Dropped","Plan to read/watch"];
const STATUS_COLORS = {
  "Completed": "#34d399", "Ongoing": "#60a5fa", "Hiatus": "#f59e0b",
  "Dropped": "#f87171", "Plan to read/watch": "#94a3b8",
};

// ─── SCORING ANCHORS ──────────────────────────────────────────────────────────
const ANCHORS = {
  Structure: {
    plot: [
      { range: "18-20", desc: "Masterfully constructed — every arc serves the whole, thematic and narrative threads pay off completely with no meaningful waste" },
      { range: "14-17", desc: "Strong overall structure with meaningful progression and only minor inconsistencies or underperforming arcs" },
      { range: "10-13", desc: "Competent but uneven — some arcs land, others feel directionless or padded" },
      { range: "6-9",   desc: "Significant structural problems, arcs that go nowhere, or a narrative that loses its thread" },
      { range: "0-5",   desc: "No coherent plot construction, or one so poorly executed it actively damages the work" },
    ],
    climax: [
      { range: "18-20", desc: "A peak moment that defines the medium — emotionally, thematically, and narratively irreplaceable, impossible to imagine the work without it" },
      { range: "14-17", desc: "Exceptional peaks that deliver on buildup and linger long after — the work is defined by them" },
      { range: "10-13", desc: "Solid climactic moments that land but don't transcend — satisfying without being unforgettable" },
      { range: "6-9",   desc: "Peaks that underdeliver relative to their setup, or works where the best moments feel accidental rather than earned" },
      { range: "0-5",   desc: "No meaningful peaks, or climaxes that actively disappoint" },
    ],
    pacing: [
      { range: "18-20", desc: "Nearly flawless — every arc breathes at exactly the right speed, no filler, no rushing, tone maintained throughout" },
      { range: "14-17", desc: "Consistently well-paced with minor stumbles — the overall rhythm serves the story" },
      { range: "10-13", desc: "Uneven — stretches of excellent pacing undermined by bloat, filler, or rushed moments" },
      { range: "6-9",   desc: "Persistent pacing issues that damage immersion — either chronically rushed or chronically bloated" },
      { range: "0-5",   desc: "Pacing so poor it fundamentally breaks the experience" },
    ],
    conclusion: [
      { range: "18-20", desc: "A perfect ending — thematically earned, narratively complete, emotionally resonant, nothing left unresolved that should have been" },
      { range: "14-17", desc: "A strong conclusion that satisfies most threads even if minor elements feel unresolved" },
      { range: "10-13", desc: "A conclusion that works but doesn't elevate — functional rather than meaningful" },
      { range: "6-9",   desc: "A weak ending that undermines what came before — rushed, unearned, or thematically hollow" },
      { range: "0-5",   desc: "An ending so poor it damages retrospective enjoyment of the entire work" },
      { range: "N/A",   desc: "Unfinished or ongoing works — set applicability to 0" },
    ],
    intro: [
      { range: "18-20", desc: "Immediately establishes tone, theme, and stakes while being compelling entirely on its own terms — sets a standard the work then meets" },
      { range: "14-17", desc: "Hooks effectively and sets up the work well, leaves you wanting more" },
      { range: "10-13", desc: "Functional — does the job without being memorable" },
      { range: "6-9",   desc: "Slow or misrepresentative — undersells what follows or sets wrong expectations" },
      { range: "0-5",   desc: "Actively repels or establishes expectations the work then fails to meet" },
    ],
  },
  Character: {
    protagonist: [
      { range: "18-20", desc: "A protagonist whose arc is thematically inseparable from the work itself — their growth, contradictions, and resolution define what the story is about. Among the finest in the medium" },
      { range: "14-17", desc: "Exceptional protagonist with a compelling arc, clear identity, and meaningful evolution — elevates every scene they're in" },
      { range: "10-13", desc: "A solid protagonist who serves the story well but whose arc lacks the depth or consistency to be truly memorable" },
      { range: "6-9",   desc: "A functional lead who gets the plot from A to B but whose inner life is shallow or inconsistently written" },
      { range: "0-5",   desc: "A protagonist who actively drags the work down — either a narrative void or so poorly written they undermine what surrounds them" },
    ],
    antagonists: [
      { range: "18-20", desc: "An antagonist roster so fully realized that the primary antagonist reframes the entire work through their existence, and the broader roster adds genuine depth — removing any major villain would collapse something important" },
      { range: "14-17", desc: "Strong antagonists with clear motivation, meaningful development, and real narrative weight — the work is clearly richer for their presence" },
      { range: "10-13", desc: "Solid antagonists who fulfill their roles effectively without being particularly complex, memorable, or thematically resonant" },
      { range: "6-9",   desc: "Antagonists who exist primarily as obstacles — motivation is thin, presence is functional at best, and the roster lacks variety or depth" },
      { range: "0-5",   desc: "An antagonist roster so poorly realized it damages the stakes and credibility of the entire work" },
    ],
    dynamics: [
      { range: "18-20", desc: "Relationships that carry the thematic weight of the entire work — interactions that recontextualize both characters and feel genuinely irreplaceable" },
      { range: "14-17", desc: "Deeply compelling dynamics with real tension, chemistry, or emotional resonance that define memorable scenes" },
      { range: "10-13", desc: "Solid relationships that work within the story without being particularly distinctive" },
      { range: "6-9",   desc: "Character interactions that feel mechanical or underdeveloped — relationships that exist by necessity rather than design" },
      { range: "0-5",   desc: "Dynamics so poorly written they feel actively false or damage the characters involved" },
    ],
    development: [
      { range: "18-20", desc: "A character arc so complete and earned it feels inevitable in retrospect — every step of growth is justified by what came before, thematically and narratively" },
      { range: "14-17", desc: "Meaningful, well-paced development that genuinely transforms the character in ways that matter to the work" },
      { range: "10-13", desc: "Noticeable development that lands but lacks the depth or consistency to be truly resonant" },
      { range: "6-9",   desc: "Surface-level or inconsistent development — change happens but feels unearned or quickly abandoned" },
      { range: "0-5",   desc: "No meaningful development, or regression so poorly handled it damages the character" },
    ],
    maincast: [
      { range: "18-20", desc: "A main cast where every member feels essential — their individual arcs, relationships, and contributions are so load-bearing that removing any one would collapse something important in the work" },
      { range: "14-17", desc: "A strong main cast with distinct identities and meaningful contributions to the narrative — the work is clearly richer for having them" },
      { range: "10-13", desc: "A functional main cast that serves the story without any member being particularly irreplaceable or deeply characterized" },
      { range: "6-9",   desc: "A main cast that feels interchangeable or underdeveloped relative to the narrative weight they're expected to carry" },
      { range: "0-5",   desc: "A main cast so poorly realized they actively undermine the protagonist's story" },
    ],
    sidecast: [
      { range: "18-20", desc: "A side cast where even minor characters feel fully realized — collectively they expand the world, reinforce themes, and create a sense the story exists beyond its leads" },
      { range: "14-17", desc: "A strong ensemble with several standout supporting characters who meaningfully contribute to the narrative" },
      { range: "10-13", desc: "A functional side cast that serves the plot without being particularly memorable as individuals" },
      { range: "6-9",   desc: "Thin supporting characters who exist primarily as plot devices or audience surrogates" },
      { range: "0-5",   desc: "A side cast so underdeveloped it makes the world feel hollow" },
    ],
    deuteragonist: [
      { range: "18-20", desc: "A second lead whose arc is as essential as the protagonist's — the work cannot be imagined without them, and their relationship with the lead is the emotional core" },
      { range: "14-17", desc: "A deuteragonist with their own compelling arc and identity who meaningfully shares narrative weight with the protagonist" },
      { range: "10-13", desc: "A solid secondary lead who enhances the work without carrying independent narrative weight" },
      { range: "6-9",   desc: "A deuteragonist who feels subordinate to the point of being interchangeable with a strong side character" },
      { range: "0-5",   desc: "A nominal deuteragonist with no meaningful arc or presence" },
      { range: "N/A",   desc: "Works with no identifiable deuteragonist or a purely ensemble structure — adjust applicability accordingly" },
    ],
  },
  Writing: {
    themes: [
      { range: "18-20", desc: "A thematic framework so deeply embedded that plot, character, and structure all exist in service of it — ideas that genuinely challenge or reframe how you think about the subject matter" },
      { range: "14-17", desc: "Rich, well-developed themes that are consistently explored and add meaningful depth to the narrative" },
      { range: "10-13", desc: "Clear thematic intent that surfaces in places but lacks the consistency or depth to be truly resonant" },
      { range: "6-9",   desc: "Themes present on the surface but underdeveloped — ideas gestured at rather than genuinely interrogated" },
      { range: "0-5",   desc: "No meaningful thematic substance, or themes so superficially handled they feel decorative" },
    ],
    emotion: [
      { range: "18-20", desc: "Emotionally devastating in a way that feels completely earned — the work breaks you because it built something worth breaking. Lingers long after completion" },
      { range: "14-17", desc: "Consistently and genuinely emotionally effective — makes you feel things that matter through craft rather than manipulation" },
      { range: "10-13", desc: "Emotionally engaging in moments without sustaining that engagement throughout" },
      { range: "6-9",   desc: "Attempts emotional impact that largely doesn't land — too manipulative, too understated, or too inconsistent" },
      { range: "0-5",   desc: "Emotionally inert — generates no meaningful feeling despite opportunities to do so" },
    ],
    dialogue: [
      { range: "18-20", desc: "Writing that sounds like no one else — dialogue that reveals character, advances theme, and is compelling purely as language. Monologues that reframe everything preceding them" },
      { range: "14-17", desc: "Consistently sharp and purposeful writing that elevates scenes and feels true to each character's voice" },
      { range: "10-13", desc: "Functional dialogue that serves the plot without being particularly distinctive or memorable" },
      { range: "6-9",   desc: "Dialogue that frequently feels unnatural, expository, or interchangeable between characters" },
      { range: "0-5",   desc: "Writing so poor it actively breaks immersion or misrepresents the characters delivering it" },
    ],
    cohesion: [
      { range: "18-20", desc: "Every element — character, plot, theme, structure — feels deliberately interconnected. Revelations recontextualize everything that preceded them. The work rewards rereading" },
      { range: "14-17", desc: "Strong cohesion with clear throughlines that pay off — the work feels authored rather than assembled" },
      { range: "10-13", desc: "Generally coherent with some threads that don't fully connect or payoffs that feel unearned" },
      { range: "6-9",   desc: "Significant cohesion failures — plot threads abandoned, tonal inconsistencies, or a work that feels like several different stories stitched together" },
      { range: "0-5",   desc: "No meaningful cohesion — the work contradicts or undermines itself to a degree that damages the whole" },
    ],
    symbolism: [
      { range: "18-20", desc: "Symbolism so deeply integrated it operates on multiple levels simultaneously — visual, narrative, and thematic. Rewards close reading and enriches every rewatch or reread" },
      { range: "14-17", desc: "Deliberate and effective symbolic language that meaningfully enhances thematic depth" },
      { range: "10-13", desc: "Some purposeful symbolism that adds texture without being central to the experience" },
      { range: "6-9",   desc: "Symbolic elements that feel surface-level or inconsistently deployed — present but not meaningfully developed" },
      { range: "0-5",   desc: "No meaningful symbolic language, or symbolism so heavy-handed it becomes parody" },
    ],
    // Arc-specific Writing anchors
    cohesion: [
      { range: "18-20", desc: "Every element within the arc — character beats, plot threads, tone, theme — feels deliberately interconnected. The arc rewards rereading and nothing feels accidental or unresolved" },
      { range: "14-17", desc: "Strong internal cohesion with clear throughlines — the arc feels authored as a unified unit rather than assembled episode by episode" },
      { range: "10-13", desc: "Generally coherent with some threads that don't fully connect or tonal inconsistencies that break immersion" },
      { range: "6-9",   desc: "Significant cohesion failures within the arc — plot threads abandoned, contradictory character behavior, or a tone that shifts without purpose" },
      { range: "0-5",   desc: "The arc contradicts or undermines itself to a degree that damages the experience as a standalone unit" },
    ],
    significance: [
      { range: "18-20", desc: "The arc is load-bearing for the entire series — it repositions characters, raises stakes, resolves or establishes threads that define the work's identity. The series cannot be imagined without it" },
      { range: "14-17", desc: "The arc meaningfully advances or enriches the series — its events, revelations, or character shifts reverberate beyond its own chapters" },
      { range: "10-13", desc: "The arc contributes to the series without being essential — it adds context or development that enriches but doesn't define the work" },
      { range: "6-9",   desc: "The arc's contribution to the series is minimal — it could largely be skipped without meaningful loss to the larger narrative" },
      { range: "0-5",   desc: "The arc is actively detrimental to the series — filler that undermines pacing, contradicts established lore, or wastes narrative momentum" },
      { range: "N/A",   desc: "Final arcs that resolve rather than advance — evaluate on quality of resolution rather than forward momentum" },
    ],
  },
  Technical: {
    visuals: [
      { range: "18-20", desc: "A visual language so distinctive and masterfully executed it stands entirely apart from its contemporaries — art that functions as storytelling in itself, irreplaceable in the medium" },
      { range: "14-17", desc: "Exceptional visual craft with a clear and consistent artistic identity that elevates every scene" },
      { range: "10-13", desc: "Strong visuals with moments of genuine artistry that don't sustain that level consistently throughout" },
      { range: "6-9",   desc: "Competent but unremarkable — visuals that serve the story without contributing meaningfully to it" },
      { range: "0-5",   desc: "Visual execution so poor it actively undermines the work" },
    ],
    direction: [
      { range: "18-20", desc: "Every panel or frame feels deliberately composed — camera work, pacing of cuts, and spatial storytelling operating at the highest level, making the work feel authored at every moment" },
      { range: "14-17", desc: "Consistently purposeful direction with standout sequences that demonstrate genuine mastery of the medium's visual language" },
      { range: "10-13", desc: "Solid directorial choices in key moments without that intentionality sustained throughout" },
      { range: "6-9",   desc: "Functional framing that conveys information without meaningfully contributing to tone or theme" },
      { range: "0-5",   desc: "Direction so poor it confuses, distances, or actively works against the material" },
    ],
    fights: [
      { range: "18-20", desc: "Action sequences that are simultaneously spectacular and thematically loaded — fights that reveal character, advance narrative, and are choreographed at a level that defines the medium" },
      { range: "14-17", desc: "Exceptional action with strong choreography and genuine stakes — sequences that are memorable long after the fact" },
      { range: "10-13", desc: "Solid action that entertains and serves the plot without reaching the heights of the best in the medium" },
      { range: "6-9",   desc: "Action that is functional but unremarkable — fights that exist without much choreographic or thematic purpose" },
      { range: "0-5",   desc: "Action sequences so poorly executed they damage pacing or immersion" },
    ],
    chardesign: [
      { range: "18-20", desc: "Designs so iconic and expressive they are inseparable from the characters themselves — silhouette, costume, and visual identity that communicate personality and theme at a glance" },
      { range: "14-17", desc: "Consistently strong designs with clear visual identities that meaningfully distinguish characters from one another" },
      { range: "10-13", desc: "Solid designs that function well without being particularly distinctive or memorable" },
      { range: "6-9",   desc: "Generic or inconsistent designs that make characters difficult to distinguish or visually uninteresting" },
      { range: "0-5",   desc: "Designs so poor they actively undermine character identity or world coherence" },
    ],
    worldbuild: [
      { range: "18-20", desc: "A world so fully realized it feels like it exists independently of the story — history, geography, culture, and internal logic that reward exploration and make every corner of the narrative feel grounded" },
      { range: "14-17", desc: "Rich and detailed worldbuilding that meaningfully shapes the plot and characters and creates a genuine sense of place" },
      { range: "10-13", desc: "Solid worldbuilding that establishes the setting effectively without being particularly deep or distinctive" },
      { range: "6-9",   desc: "Surface-level world construction that serves immediate plot needs without creating a convincing or explorable reality" },
      { range: "0-5",   desc: "Worldbuilding so thin or inconsistent it undermines immersion and credibility" },
    ],
    music: [
      { range: "18-20", desc: "A soundtrack so perfectly integrated it becomes inseparable from the work's most defining moments — compositions that elevate scenes beyond what image alone could achieve and function as standalone art" },
      { range: "14-17", desc: "Consistently excellent music that meaningfully enhances tone, emotion, and atmosphere throughout" },
      { range: "10-13", desc: "Strong musical moments that don't sustain that quality consistently — a good soundtrack with peaks and unremarkable stretches" },
      { range: "6-9",   desc: "A functional score that fills space without meaningfully contributing to the work's emotional or thematic impact" },
      { range: "0-5",   desc: "Music so poorly chosen or executed it actively damages the experience" },
      { range: "N/A",   desc: "Manga-only entries — set applicability to 0" },
    ],
  },
};



// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bocjszpvovustgetvira.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_O_VGkUQ2fhs_9DpwABdVcw_GyG2T97F";

// Global token getter/setter so sbFetch can update React state
let _getToken = () => null;
let _setToken = (token) => {};

async function sbFetch(path, method = "GET", body = null, token = null, _retry = false) {
  const activeToken = token || _getToken() || SUPABASE_ANON_KEY;
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${activeToken}`,
    "Prefer": method === "POST" ? "return=representation" : "",
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method, headers, body: body ? JSON.stringify(body) : null,
  });
  if (res.status === 401 && !_retry) {
    try {
      const saved = localStorage.getItem("animanga_session");
      if (saved) {
        const sess = JSON.parse(saved);
        if (sess.refreshToken) {
          const refreshRes = await refreshSession(sess.refreshToken);
          if (refreshRes.access_token) {
            const newSess = {
              ...sess,
              token: refreshRes.access_token,
              refreshToken: refreshRes.refresh_token,
              expiresAt: Date.now() + (refreshRes.expires_in || 3600) * 1000,
            };
            localStorage.setItem("animanga_session", JSON.stringify(newSess));
            _setToken(refreshRes.access_token);
            return sbFetch(path, method, body, refreshRes.access_token, true);
          }
        }
      }
    } catch {}
  }
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function signUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
async function signOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` },
  });
}

async function refreshSession(refreshToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return res.json();
}
async function updatePassword(token, newPassword) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ password: newPassword }),
  });
  return res.json();
}
async function upsertRating(token, userId, username, title, data) {
  const activeToken = token || _getToken() || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ratings?on_conflict=user_id,title`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${activeToken}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ user_id: userId, username, title, data }),
  });
  if (res.status === 401) {
    // Refresh and retry once
    try {
      const saved = localStorage.getItem("animanga_session");
      if (saved) {
        const sess = JSON.parse(saved);
        if (sess.refreshToken) {
          const refreshRes = await refreshSession(sess.refreshToken);
          if (refreshRes.access_token) {
            const newSess = { ...sess, token: refreshRes.access_token, refreshToken: refreshRes.refresh_token, expiresAt: Date.now() + (refreshRes.expires_in || 3600) * 1000 };
            localStorage.setItem("animanga_session", JSON.stringify(newSess));
            _setToken(refreshRes.access_token);
            const retry = await fetch(`${SUPABASE_URL}/rest/v1/ratings?on_conflict=user_id,title`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${refreshRes.access_token}`,
                "Prefer": "resolution=merge-duplicates,return=representation",
              },
              body: JSON.stringify({ user_id: userId, username, title, data }),
            });
            if (!retry.ok) throw new Error(await retry.text());
            return;
          }
        }
      }
    } catch (e) { throw e; }
  }
  if (!res.ok) throw new Error(await res.text());
}
async function fetchAllRatings(token) { return await sbFetch("ratings?select=*", "GET", null, token) || []; }
async function fetchTitles(token) { return await sbFetch("titles?select=*&order=created_at.asc", "GET", null, token) || []; }
async function addPending(token, title, suggestedBy) { await sbFetch("titles", "POST", { title, approved: false, suggested_by: suggestedBy }, token); }
async function approveTitle(token, id) { await sbFetch(`titles?id=eq.${id}`, "PATCH", { approved: true }, token); }
async function deleteTitle(token, id) { await sbFetch(`titles?id=eq.${id}`, "DELETE", null, token); }
async function fetchApplicability(token) { return await sbFetch("applicability?select=*", "GET", null, token) || []; }
async function upsertApplicability(token, title, data) {
  const activeToken = token || _getToken() || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/applicability?on_conflict=title`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${activeToken}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ title, data }),
  });
  if (!res.ok) throw new Error(await res.text());
}
async function fetchProfiles(token) { return await sbFetch("profiles?select=*", "GET", null, token) || []; }
async function upsertProfile(token, userId, username, isAdmin) { await sbFetch("profiles?on_conflict=id", "POST", { id: userId, username, is_admin: isAdmin }, token); }

// ─── ARC DB FUNCTIONS ─────────────────────────────────────────────────────────
async function fetchArcs(token) { return await sbFetch("arcs?select=*&order=created_at.asc", "GET", null, token) || []; }
async function addArcPending(token, title, arcName, suggestedBy) { await sbFetch("arcs", "POST", { title, arc_name: arcName, approved: false, suggested_by: suggestedBy }, token); }
async function approveArc(token, id) { await sbFetch(`arcs?id=eq.${id}`, "PATCH", { approved: true }, token); }
async function deleteArc(token, id) { await sbFetch(`arcs?id=eq.${id}`, "DELETE", null, token); }
async function fetchAllArcRatings(token) { return await sbFetch("arc_ratings?select=*", "GET", null, token) || []; }
async function fetchArcApplicability(token) { return await sbFetch("arc_applicability?select=*", "GET", null, token) || []; }
async function upsertArcApplicability(token, arcId, data) {
  const activeToken = token || _getToken() || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/arc_applicability?on_conflict=arc_id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${activeToken}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ arc_id: arcId, data }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function upsertArcRating(token, userId, username, arcId, data) {
  const activeToken = token || _getToken() || SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/arc_ratings?on_conflict=user_id,arc_id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${activeToken}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ user_id: userId, username, arc_id: arcId, data }),
  });
  if (res.status === 401) {
    try {
      const saved = localStorage.getItem("animanga_session");
      if (saved) {
        const sess = JSON.parse(saved);
        if (sess.refreshToken) {
          const refreshRes = await refreshSession(sess.refreshToken);
          if (refreshRes.access_token) {
            const newSess = { ...sess, token: refreshRes.access_token, refreshToken: refreshRes.refresh_token, expiresAt: Date.now() + (refreshRes.expires_in || 3600) * 1000 };
            localStorage.setItem("animanga_session", JSON.stringify(newSess));
            _setToken(refreshRes.access_token);
            const retry = await fetch(`${SUPABASE_URL}/rest/v1/arc_ratings?on_conflict=user_id,arc_id`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${refreshRes.access_token}`, "Prefer": "resolution=merge-duplicates,return=representation" },
              body: JSON.stringify({ user_id: userId, username, arc_id: arcId, data }),
            });
            if (!retry.ok) throw new Error(await retry.text());
            return;
          }
        }
      }
    } catch (e) { throw e; }
  }
  if (!res.ok) throw new Error(await res.text());
}
async function fetchInviteCode(token) {
  const rows = await sbFetch("settings?key=eq.invite_code&select=*", "GET", null, token) || [];
  return rows[0]?.value || null;
}
async function saveInviteCode(token, code) {
  await sbFetch("settings?on_conflict=key", "POST", { key: "invite_code", value: code }, token);
}

// ─── MATH ─────────────────────────────────────────────────────────────────────
function calcCategoryScore(cat, scores, applicability, subcatConfig) {
  const subs = (subcatConfig || SUBCATEGORIES)[cat];
  if (!subs) return null;
  let wSum = 0, wScoreSum = 0;
  for (const s of subs) {
    const app = applicability?.[cat]?.[s.key] ?? 1;
    const adjW = s.weight * app;
    const sc = scores?.[cat]?.[s.key];
    if (sc !== undefined && sc !== null && sc !== "") { wScoreSum += Number(sc) * adjW; wSum += adjW; }
  }
  return wSum > 0 ? wScoreSum / wSum : null;
}
function calcFinalScore(scores, applicability, catWeights, subcatConfig) {
  const cw = catWeights || CATEGORY_WEIGHTS;
  const sc = subcatConfig || SUBCATEGORIES;
  let wSum = 0, wScoreSum = 0;
  for (const cat of Object.keys(cw)) {
    const cs = calcCategoryScore(cat, scores, applicability, sc);
    if (cs !== null) { const w = cw[cat]; wScoreSum += cs * w; wSum += w; }
  }
  return wSum > 0 ? wScoreSum / wSum : null;
}
function scoreColor(s) {
  if (s === null || s === undefined) return "#94a3b8";
  if (s >= 16) return "#f59e0b"; if (s >= 13) return "#60a5fa";
  if (s >= 10) return "#34d399"; if (s >= 7) return "#fb923c";
  return "#f87171";
}

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { margin: 0; padding: 0; background: #0f1623; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1e2533; }
  ::-webkit-scrollbar-thumb { background: #3a4560; border-radius: 3px; }
  textarea { resize: vertical; }
  .grid-input:focus { outline: 2px solid #3b82f6; outline-offset: -1px; background: #0f1e30; }
  .lb-row:hover { background: #131d2e; }
`;
const F = "'Inter', system-ui, sans-serif";

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState("loading");
  const [session, setSession]       = useState(null);
  const [titles, setTitles]         = useState([]);
  const [pending, setPending]       = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [applicability, setApplicability] = useState({});
  const [profiles, setProfiles]     = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [activeTitle, setActiveTitle]   = useState(null);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [viewingUser, setViewingUser]   = useState(null);
  const [comparingTitle, setComparingTitle] = useState(null);
  const [arcs, setArcs]                 = useState([]);
  const [pendingArcs, setPendingArcs]   = useState([]);
  const [allArcRatings, setAllArcRatings] = useState([]);
  const [activeArc, setActiveArc]       = useState(null); // { id, title, arc_name }
  const [arcApplicability, setArcApplicability] = useState({});
  const [lbMode, setLbMode]         = useState("combined");
  const [mainTab, setMainTab]       = useState("leaderboard");
  const [toast, setToast]           = useState(null);
  const [loginForm, setLoginForm]   = useState({ email: "", password: "", username: "", inviteCode: "", isNew: false });
  const [suggestForm, setSuggestForm] = useState({ title: "" });
  const [showPwChange, setShowPwChange] = useState(false);
  const [loading, setLoading]       = useState(false);

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };
  const isConfigured = SUPABASE_URL !== "YOUR_SUPABASE_URL";

  // Wire global token getter/setter so sbFetch can update React state on 401 refresh
  useEffect(() => {
    _getToken = () => session?.token || null;
    _setToken = (newToken) => {
      setSession(prev => {
        if (!prev) return prev;
        const updated = { ...prev, token: newToken };
        localStorage.setItem("animanga_session", JSON.stringify(updated));
        return updated;
      });
    };
  }, [session]);

  useEffect(() => {
    if (!isConfigured) { setView("unconfigured"); return; }
    (async () => {
      const saved = localStorage.getItem("animanga_session");
      if (saved) {
        try {
          let sess = JSON.parse(saved);
          const msUntilExpiry = (sess.expiresAt || 0) - Date.now();
          if (sess.refreshToken && msUntilExpiry < 10 * 60 * 1000) {
            const res = await refreshSession(sess.refreshToken);
            if (res.access_token) {
              sess = { ...sess, token: res.access_token, refreshToken: res.refresh_token, expiresAt: Date.now() + (res.expires_in || 3600) * 1000 };
              localStorage.setItem("animanga_session", JSON.stringify(sess));
            }
          }
          setSession(sess);
          loadAll(sess).then(() => setView("main"));
        } catch { setView("login"); }
      } else { setView("login"); }
    })();
  }, []);

  // Auto-refresh token 5 minutes before expiry
  useEffect(() => {
    if (!session) return;
    const msUntilExpiry = (session.expiresAt || 0) - Date.now();
    const refreshIn = Math.max(msUntilExpiry - 5 * 60 * 1000, 0);
    const timer = setTimeout(async () => {
      if (!session.refreshToken) return;
      try {
        const res = await refreshSession(session.refreshToken);
        if (res.access_token) {
          const newSess = {
            ...session,
            token: res.access_token,
            refreshToken: res.refresh_token,
            expiresAt: Date.now() + (res.expires_in || 3600) * 1000,
          };
          setSession(newSess);
          localStorage.setItem("animanga_session", JSON.stringify(newSess));
        }
      } catch (e) { console.error("Token refresh failed", e); }
    }, refreshIn);
    return () => clearTimeout(timer);
  }, [session]);

  const loadAll = async (sess) => {
    try {
      const [rawTitles, rawRatings, rawApplic, rawProfiles, code, rawArcs, rawArcRatings, rawArcApplic] = await Promise.all([
        fetchTitles(sess.token), fetchAllRatings(sess.token),
        fetchApplicability(sess.token), fetchProfiles(sess.token),
        fetchInviteCode(sess.token), fetchArcs(sess.token),
        fetchAllArcRatings(sess.token), fetchArcApplicability(sess.token),
      ]);
      setTitles(rawTitles.filter(t => t.approved).map(t => ({ id: t.id, title: t.title })));
      setPending(rawTitles.filter(t => !t.approved));
      setAllRatings(rawRatings);
      const appMap = {};
      for (const row of rawApplic) appMap[row.title] = row.data;
      setApplicability(appMap);
      setProfiles(rawProfiles);
      setInviteCode(code || "");
      setArcs(rawArcs.filter(a => a.approved).map(a => ({ id: a.id, title: a.title, arc_name: a.arc_name })));
      setPendingArcs(rawArcs.filter(a => !a.approved));
      setAllArcRatings(rawArcRatings);
      const arcAppMap = {};
      for (const row of rawArcApplic) arcAppMap[row.arc_id] = row.data;
      setArcApplicability(arcAppMap);
    } catch { showToast("Failed to load data", "err"); }
  };

  const handleLogin = async () => {
    const { email, password, username, inviteCode: enteredCode, isNew } = loginForm;
    if (!email.trim() || !password.trim()) return showToast("Fill in all fields", "err");
    if (isNew && !username.trim()) return showToast("Enter a username", "err");
    setLoading(true);
    try {
      if (isNew) {
        // Validate invite code
        const serverCode = await fetchInviteCode(null);
        if (serverCode && enteredCode.trim().toLowerCase() !== serverCode.toLowerCase())
          return showToast("Invalid invite code", "err");
        const res = await signUp(email, password);
        if (res.error) return showToast(res.error.message || "Signup failed", "err");
        const sess = { token: res.access_token, refreshToken: res.refresh_token, expiresAt: Date.now() + (res.expires_in || 3600) * 1000, userId: res.user.id, username: username.trim(), isAdmin: false };
        await upsertProfile(sess.token, sess.userId, sess.username, false);
        localStorage.setItem("animanga_session", JSON.stringify(sess));
        setSession(sess); await loadAll(sess); setView("main"); showToast(`Welcome, ${sess.username}!`);
      } else {
        const res = await signIn(email, password);
        if (res.error) return showToast(res.error.message || "Login failed", "err");
        const profileRows = await sbFetch(`profiles?id=eq.${res.user.id}&select=*`, "GET", null, res.access_token);
        const profile = profileRows?.[0];
        const sess = { token: res.access_token, refreshToken: res.refresh_token, expiresAt: Date.now() + (res.expires_in || 3600) * 1000, userId: res.user.id, username: profile?.username || email.split("@")[0], isAdmin: profile?.is_admin || false };
        localStorage.setItem("animanga_session", JSON.stringify(sess));
        setSession(sess); await loadAll(sess); setView("main"); showToast(`Welcome back, ${sess.username}!`);
      }
    } catch { showToast("Something went wrong", "err"); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    if (session?.token) await signOut(session.token);
    localStorage.removeItem("animanga_session");
    setSession(null); setView("login");
  };

  const handlePasswordChange = async (newPw) => {
    try {
      const res = await updatePassword(session.token, newPw);
      if (res.error) return showToast(res.error.message || "Failed", "err");
      showToast("Password updated"); setShowPwChange(false);
    } catch { showToast("Failed", "err"); }
  };

  const saveRating = async (title, data) => {
    try {
      await upsertRating(session.token, session.userId, session.username, title, data);
      setAllRatings(prev => {
        const filtered = prev.filter(r => !(r.user_id === session.userId && r.title === title));
        return [...filtered, { user_id: session.userId, username: session.username, title, data }];
      });
      showToast("Saved");
    } catch { showToast("Save failed", "err"); }
  };

  const saveApplicability = async (title, data) => {
    try {
      await upsertApplicability(session.token, title, data);
      setApplicability(prev => ({ ...prev, [title]: data }));
      showToast("Applicability saved");
    } catch { showToast("Save failed", "err"); }
  };

  const handleSaveInviteCode = async (code) => {
    try {
      await saveInviteCode(session.token, code);
      setInviteCode(code);
      showToast("Invite code saved");
    } catch { showToast("Failed", "err"); }
  };

  const submitSuggestion = async () => {
    if (!suggestForm.title.trim()) return showToast("Enter a title", "err");
    try {
      await addPending(session.token, suggestForm.title.trim(), session.username);
      await loadAll(session); setSuggestForm({ title: "" }); showToast("Suggestion submitted");
    } catch { showToast("Failed", "err"); }
  };

  const approveSuggestion = async (item) => {
    try { await approveTitle(session.token, item.id); await loadAll(session); showToast(`"${item.title}" added`); }
    catch { showToast("Failed", "err"); }
  };

  const rejectSuggestion = async (item) => {
    try { await deleteTitle(session.token, item.id); await loadAll(session); showToast("Rejected"); }
    catch { showToast("Failed", "err"); }
  };

  const saveArcApplicability = async (arcId, data) => {
    try {
      await upsertArcApplicability(session.token, arcId, data);
      setArcApplicability(prev => ({ ...prev, [arcId]: data }));
      showToast("Applicability saved");
    } catch { showToast("Save failed", "err"); }
  };

  const saveArcRating = async (arcId, data) => {
    try {
      await upsertArcRating(session.token, session.userId, session.username, arcId, data);
      setAllArcRatings(prev => {
        const filtered = prev.filter(r => !(r.user_id === session.userId && r.arc_id === arcId));
        return [...filtered, { user_id: session.userId, username: session.username, arc_id: arcId, data }];
      });
      showToast("Saved");
    } catch { showToast("Save failed", "err"); }
  };

  const submitArcSuggestion = async (titleName, arcName) => {
    if (!arcName.trim()) return showToast("Enter an arc name", "err");
    try {
      await addArcPending(session.token, titleName, arcName.trim(), session.username);
      await loadAll(session); showToast("Suggestion submitted");
    } catch { showToast("Failed", "err"); }
  };

  const approveArcSuggestion = async (item) => {
    try { await approveArc(session.token, item.id); await loadAll(session); showToast(`"${item.arc_name}" added`); }
    catch { showToast("Failed", "err"); }
  };

  const rejectArcSuggestion = async (item) => {
    try { await deleteArc(session.token, item.id); await loadAll(session); showToast("Rejected"); }
    catch { showToast("Failed", "err"); }
  };

  const myArcRatingFor = (arcId) => allArcRatings.find(r => r.user_id === session?.userId && r.arc_id === arcId);

  const getArcLeaderboard = () => arcs.map(arc => {
    const arcRatings = allArcRatings.filter(r => r.arc_id === arc.id);
    const userScores = arcRatings.map(r => {
      const sc = calcFinalScore(r.data?.scores, {}, ARC_CATEGORY_WEIGHTS, ARC_SUBCATEGORIES);
      return sc !== null ? { user: r.username, score: sc } : null;
    }).filter(Boolean);
    const combined = userScores.length ? userScores.reduce((s, x) => s + x.score, 0) / userScores.length : null;
    const myData = myArcRatingFor(arc.id);
    const myScore = myData ? calcFinalScore(myData.data?.scores, {}, ARC_CATEGORY_WEIGHTS, ARC_SUBCATEGORIES) : null;
    const myStatus = myData?.data?.status || null;
    const divergence = (combined !== null && myScore !== null) ? Math.abs(myScore - combined) : null;
    return { ...arc, combined, myScore, myStatus, divergence, ratedBy: userScores.length };
  }).sort((a, b) => {
    const sa = lbMode === "combined" ? a.combined : a.myScore;
    const sb = lbMode === "combined" ? b.combined : b.myScore;
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1; if (sb === null) return -1;
    return sb - sa;
  });

  const handleExport = () => {
    const myRatings = allRatings.filter(r => r.user_id === session.userId);
    const exportData = { exportedAt: new Date().toISOString(), username: session.username, titles: titles.map(t => t.title), applicability, ratings: {} };
    for (const r of myRatings) exportData.ratings[r.title] = r.data;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `animanga_ratings_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url); showToast("Downloaded");
  };

  const myRatingFor = (title) => allRatings.find(r => r.user_id === session?.userId && r.title === title);

  const getLeaderboard = () => titles.map(({ title }) => {
    const titleApp = applicability[title] || {};
    const titleRatings = allRatings.filter(r => r.title === title);
    const userScores = titleRatings.map(r => {
      const sc = calcFinalScore(r.data?.scores, titleApp);
      return sc !== null ? { user: r.username, score: sc } : null;
    }).filter(Boolean);
    const combined = userScores.length ? userScores.reduce((s, x) => s + x.score, 0) / userScores.length : null;
    const myData = myRatingFor(title);
    const myScore = myData ? calcFinalScore(myData.data?.scores, titleApp) : null;
    const myStatus = myData?.data?.status || null;
    const divergence = (combined !== null && myScore !== null) ? Math.abs(myScore - combined) : null;
    return { title, combined, myScore, myStatus, divergence, userScores, ratedBy: userScores.length };
  }).sort((a, b) => {
    const sa = lbMode === "combined" ? a.combined : a.myScore;
    const sb = lbMode === "combined" ? b.combined : b.myScore;
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1; if (sb === null) return -1;
    return sb - sa;
  });

  const getSubcatLeaderboard = (cat, subkey) => titles.map(({ title }) => {
    const titleApp = applicability[title] || {};
    const app = titleApp?.[cat]?.[subkey] ?? 1;
    const titleRatings = allRatings.filter(r => r.title === title);
    const userScores = titleRatings.map(r => {
      const sc = r.data?.scores?.[cat]?.[subkey];
      return (sc !== undefined && sc !== null) ? { user: r.username, score: Number(sc) } : null;
    }).filter(Boolean);
    const combined = userScores.length ? userScores.reduce((s, x) => s + x.score, 0) / userScores.length : null;
    const myData = myRatingFor(title);
    const myScore = myData?.data?.scores?.[cat]?.[subkey];
    return { title, combined, myScore: myScore !== undefined ? Number(myScore) : null, userScores, app, ratedBy: userScores.length };
  }).sort((a, b) => {
    const sa = lbMode === "combined" ? a.combined : a.myScore;
    const sb = lbMode === "combined" ? b.combined : b.myScore;
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1; if (sb === null) return -1;
    return sb - sa;
  });

  const updateInlineScore = async (title, cat, subkey, val) => {
    const existing = myRatingFor(title);
    const currentData = existing?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} };
    const newScores = { ...currentData.scores, [cat]: { ...(currentData.scores[cat] || {}), [subkey]: val === "" ? undefined : Number(val) } };
    await saveRating(title, { ...currentData, scores: newScores });
  };

  if (view === "loading") return <div style={S.center}><style>{fontStyle}</style><Spinner /></div>;
  if (view === "unconfigured") return (
    <div style={S.center}><style>{fontStyle}</style>
      <div style={{ ...S.loginCard, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>Not Configured</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Replace SUPABASE_URL and SUPABASE_ANON_KEY at the top of the file.</div>
      </div>
    </div>
  );
  if (view === "login") return <LoginScreen form={loginForm} setForm={setLoginForm} onSubmit={handleLogin} loading={loading} />;

  if (view === "main" && viewingUser && comparingTitle) return (
    <TitleComparison
      title={comparingTitle}
      myData={myRatingFor(comparingTitle)?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} }}
      theirData={allRatings.find(r => r.user_id === viewingUser.userId && r.title === comparingTitle)?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} }}
      applicability={applicability[comparingTitle] || {}}
      myUsername={session?.username}
      theirUsername={viewingUser.username}
      onBack={() => setComparingTitle(null)}
    />
  );

  if (view === "main" && viewingUser && activeTitle) return (
    <UserRatingSheet
      title={activeTitle}
      data={allRatings.find(r => r.user_id === viewingUser.userId && r.title === activeTitle)?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} }}
      applicability={applicability[activeTitle] || {}}
      username={viewingUser.username}
      myData={myRatingFor(activeTitle)?.data}
      onBack={() => setActiveTitle(null)}
      onCompare={() => setComparingTitle(activeTitle)}
    />
  );

  if (view === "main" && viewingUser) return (
    <UserProfile
      user={viewingUser}
      titles={titles}
      allRatings={allRatings}
      applicability={applicability}
      myUserId={session?.userId}
      myUsername={session?.username}
      onBack={() => { setViewingUser(null); setActiveTitle(null); }}
      onViewTitle={(title) => setActiveTitle(title)}
      onCompareAll={() => setComparingTitle("__all__")}
      lbMode={lbMode}
      setLbMode={setLbMode}
    />
  );

  if (view === "main" && comparingTitle === "__all__" && viewingUser === null) return null;

  if (view === "main" && activeArc) return (
    <ArcRatingSheet
      arc={activeArc}
      data={myArcRatingFor(activeArc.id)?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} }}
      applicability={arcApplicability[activeArc.id] || {}}
      onSave={(d) => saveArcRating(activeArc.id, d)}
      onSaveApplicability={(a) => saveArcApplicability(activeArc.id, a)}
      onBack={() => setActiveArc(null)}
      isAdmin={session?.isAdmin}
    />
  );

  if (view === "main" && activeTitle) return (
    <RatingSheet title={activeTitle}
      data={myRatingFor(activeTitle)?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} }}
      applicability={applicability[activeTitle] || {}}
      onSave={(d) => saveRating(activeTitle, d)}
      onBack={() => setActiveTitle(null)}
      isAdmin={session?.isAdmin}
      onSaveApplicability={(a) => saveApplicability(activeTitle, a)} />
  );
  if (view === "main" && activeSubcat) return (
    <SubcatLeaderboard subcat={activeSubcat}
      rows={getSubcatLeaderboard(activeSubcat.cat, activeSubcat.key)}
      lbMode={lbMode} setLbMode={setLbMode}
      onBack={() => setActiveSubcat(null)}
      onEditInline={(title, val) => updateInlineScore(title, activeSubcat.cat, activeSubcat.key, val)} />
  );

  const lbData = getLeaderboard();
  const maxDivergence = Math.max(...lbData.map(r => r.divergence || 0));

  return (
    <div style={S.app}>
      <style>{fontStyle}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showPwChange && <PasswordChangeModal onSave={handlePasswordChange} onClose={() => setShowPwChange(false)} />}

      <div style={S.header}>
        <div style={S.headerLogo}><span style={S.logoA}>ANIMANGA</span><span style={S.logoB}>RATER</span></div>
        <div style={S.headerTabs}>
          {["leaderboard","subcats","bulk","arcs","admin"].map(t => (
            <button key={t} onClick={() => setMainTab(t)}
              style={{ ...S.headerTab, ...(mainTab === t ? S.headerTabActive : {}) }}>
              {t === "leaderboard" ? "OVERALL" : t === "subcats" ? "SUBCATEGORIES" : t === "bulk" ? "BULK ENTRY" : t === "arcs" ? "ARCS" : "ADMIN"}
            </button>
          ))}
        </div>
        <div style={S.headerRight}>
          <span style={S.headerUser}>{session?.username}{session?.isAdmin ? " ★" : ""}</span>
          <button style={S.ghostBtn} onClick={() => setShowPwChange(true)}>Password</button>
          <button style={S.ghostBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ── OVERALL LEADERBOARD ── */}
      {mainTab === "leaderboard" && (
        <div style={S.pageWrap}>
          <div style={S.leaderWrap}>
            <div style={S.panelHead}>
              <span style={S.panelTitle}>OVERALL RANKINGS</span>
              <div style={S.modeToggle}>
                {["combined","individual"].map(m => (
                  <button key={m} onClick={() => setLbMode(m)}
                    style={{ ...S.modeBtn, ...(lbMode === m ? S.modeBtnActive : {}) }}>
                    {m === "combined" ? "AVG" : "MINE"}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.lbTable}>
              <div style={S.lbHeaderRow}>
                <span style={{ width: 36 }}>#</span>
                <span style={{ flex: 1 }}>Title</span>
                <span style={{ width: 110 }}>Status</span>
                <span style={{ width: 80, textAlign: "right" }}>Score</span>
                {lbMode === "combined" && <>
                  <span style={{ width: 60, textAlign: "right", fontSize: 11, color: "#64748b" }}>Mine</span>
                  <span style={{ width: 70, textAlign: "right", fontSize: 11, color: "#64748b" }}>Diff</span>
                </>}
                <span style={{ width: 70, textAlign: "right" }}>Ratings</span>
              </div>
              {lbData.map((row, i) => {
                const score = lbMode === "combined" ? row.combined : row.myScore;
                const divOpacity = maxDivergence > 0 && row.divergence !== null ? row.divergence / maxDivergence : 0;
                return (
                  <div key={row.title} className="lb-row" style={{ ...S.lbRow, cursor: "pointer" }}
                    onClick={() => setActiveTitle(row.title)}>
                    <span style={{ ...S.rank, color: i < 3 ? ["#f59e0b","#94a3b8","#cd7c3a"][i] : "#475569" }}>{i+1}</span>
                    <span style={S.lbTitleText}>{row.title}</span>
                    <span style={{ width: 110 }}>
                      {row.myStatus && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLORS[row.myStatus],
                          background: `${STATUS_COLORS[row.myStatus]}18`, padding: "2px 8px", borderRadius: 20 }}>
                          {row.myStatus}
                        </span>
                      )}
                    </span>
                    <span style={{ width: 80, textAlign: "right", fontSize: 18, fontWeight: 700, color: scoreColor(score) }}>
                      {score !== null ? score.toFixed(2) : <span style={{ color: "#334155" }}>—</span>}
                    </span>
                    {lbMode === "combined" && <>
                      <span style={{ width: 60, textAlign: "right", fontSize: 12, color: scoreColor(row.myScore) }}>
                        {row.myScore !== null ? row.myScore.toFixed(1) : "—"}
                      </span>
                      <span style={{ width: 70, textAlign: "right", fontSize: 12,
                        color: row.divergence !== null ? `rgba(251,146,60,${0.4 + divOpacity * 0.6})` : "#334155",
                        fontWeight: divOpacity > 0.6 ? 700 : 400 }}>
                        {row.divergence !== null ? `±${row.divergence.toFixed(1)}` : "—"}
                      </span>
                    </>}
                    <span style={{ width: 70, textAlign: "right", fontSize: 12, color: "#475569" }}>
                      {row.ratedBy} user{row.ratedBy !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            {lbMode === "combined" && lbData.some(r => r.divergence !== null) && (
              <div style={{ padding: "10px 20px", borderTop: "1px solid #1e2d3d", fontSize: 11, color: "#475569" }}>
                ± Diff = how far your score is from the group average. Brighter orange = bigger disagreement.
              </div>
            )}
          </div>

          <div style={S.sidebar}>
            <div style={S.card}>
              <div style={S.cardLabel}>SUGGEST TITLE</div>
              <input style={S.input} placeholder="Title name" value={suggestForm.title}
                onChange={e => setSuggestForm({ title: e.target.value })}
                onKeyDown={e => e.key === "Enter" && submitSuggestion()} />
              <button style={S.primaryBtn} onClick={submitSuggestion}>Submit</button>
            </div>
            <div style={S.card}>
              <div style={S.cardLabel}>USERS</div>
              {profiles.map(p => {
                const count = allRatings.filter(r => r.user_id === p.id).length;
                const isMe = p.id === session?.userId;
                return (
                  <div key={p.id} style={{ ...S.userRow, cursor: isMe ? "default" : "pointer" }}
                    onClick={() => !isMe && setViewingUser({ username: p.username, userId: p.id })}>
                    <span style={{ ...S.userName, color: isMe ? "#60a5fa" : "#94a3b8" }}>
                      {p.username}{p.is_admin ? " ★" : ""}{isMe ? " (you)" : ""}
                    </span>
                    <span style={S.userCount}>{count} rated</span>
                  </div>
                );
              })}
            </div>
            <div style={S.card}>
              <div style={S.cardLabel}>EXPORT</div>
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>Download all your scores as a JSON backup.</p>
              <button style={{ ...S.primaryBtn, background: "#16a34a" }} onClick={handleExport}>↓ Download My Scores</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBCATEGORY LEADERBOARDS ── */}
      {mainTab === "subcats" && (
        <div style={S.subcatPage}>
          <div style={S.subcatPageHead}>
            <span style={S.panelTitle}>SUBCATEGORY LEADERBOARDS</span>
            <div style={S.modeToggle}>
              {["combined","individual"].map(m => (
                <button key={m} onClick={() => setLbMode(m)}
                  style={{ ...S.modeBtn, ...(lbMode === m ? S.modeBtnActive : {}) }}>
                  {m === "combined" ? "AVG" : "MINE"}
                </button>
              ))}
            </div>
          </div>
          {CATEGORIES.map(cat => (
            <div key={cat} style={S.subcatCatBlock}>
              <div style={S.subcatCatLabel}>{cat.toUpperCase()}</div>
              <div style={S.subcatCardGrid}>
                {SUBCATEGORIES[cat].map(s => {
                  const rows = getSubcatLeaderboard(cat, s.key);
                  const top3 = rows.filter(r => (lbMode === "combined" ? r.combined : r.myScore) !== null).slice(0,3);
                  return (
                    <div key={s.key} style={S.subcatCard} onClick={() => setActiveSubcat({ ...s, cat })}>
                      <div style={S.subcatCardLabel}>{s.label}</div>
                      <div style={S.subcatCardWeight}>{(s.weight*100).toFixed(0)}% of {cat}</div>
                      {top3.length === 0 ? <div style={S.subcatEmpty}>No scores yet</div>
                        : top3.map((row, i) => {
                          const sc = lbMode === "combined" ? row.combined : row.myScore;
                          return (
                            <div key={row.title} style={S.subcatMiniRow}>
                              <span style={{ ...S.rank, fontSize: 11, color: i === 0 ? "#f59e0b" : "#475569" }}>{i+1}</span>
                              <span style={S.subcatMiniTitle}>{row.title}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(sc) }}>{sc?.toFixed(1)}</span>
                            </div>
                          );
                        })
                      }
                      <div style={S.subcatCardFooter}>View all →</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BULK ENTRY ── */}
      {mainTab === "bulk" && (
        <BulkEntry
          titles={titles}
          allRatings={allRatings}
          applicability={applicability}
          myUserId={session?.userId}
          myUsername={session?.username}
          onSaveAll={async (changedRatings) => {
            for (const [title, data] of Object.entries(changedRatings)) {
              await saveRating(title, data);
            }
            showToast(`Saved ${Object.keys(changedRatings).length} title(s)`);
          }}
        />
      )}

      {/* ── ARCS ── */}
      {mainTab === "arcs" && (
        <ArcLeaderboard
          arcs={arcs}
          allArcRatings={allArcRatings}
          arcLeaderboard={getArcLeaderboard()}
          lbMode={lbMode}
          setLbMode={setLbMode}
          onViewArc={(arc) => setActiveArc(arc)}
          onSuggest={submitArcSuggestion}
          myUserId={session?.userId}
          titles={titles}
        />
      )}

      {/* ── ADMIN ── */}
      {mainTab === "admin" && (
        <div style={S.adminPage}>
          {!session?.isAdmin ? <div style={S.noAdmin}>Admin access required.</div> : (
            <>
              <div style={S.card}>
                <div style={S.cardLabel}>INVITE CODE</div>
                <p style={S.adminHint}>Anyone registering must enter this code. Leave blank to disable invite-only mode.</p>
                <InviteCodeEditor current={inviteCode} onSave={handleSaveInviteCode} />
              </div>
              {pending.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardLabel}>PENDING SUGGESTIONS</div>
                  {pending.map(item => (
                    <div key={item.id} style={S.pendingRow}>
                      <div>
                        <div style={S.pendingTitle}>{item.title}</div>
                        <div style={S.pendingMeta}>suggested by {item.suggested_by}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={S.approveBtn} onClick={() => approveSuggestion(item)}>✓ Approve</button>
                        <button style={S.rejectBtn} onClick={() => rejectSuggestion(item)}>✕ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {pendingArcs.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardLabel}>PENDING ARC SUGGESTIONS</div>
                  {pendingArcs.map(item => (
                    <div key={item.id} style={S.pendingRow}>
                      <div>
                        <div style={S.pendingTitle}>{item.arc_name}</div>
                        <div style={S.pendingMeta}>{item.title} · suggested by {item.suggested_by}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={S.approveBtn} onClick={() => approveArcSuggestion(item)}>✓ Approve</button>
                        <button style={S.rejectBtn} onClick={() => rejectArcSuggestion(item)}>✕ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={S.card}>
                <div style={S.cardLabel}>APPLICABILITY SETTINGS</div>
                <p style={S.adminHint}>Set per-title applicability. 1 = fully applicable, 0 = not applicable.</p>
                <div style={S.applicGrid}>
                  {titles.map(({ title }) => (
                    <ApplicabilityEditor key={title} title={title}
                      current={applicability[title] || {}}
                      onSave={(a) => saveApplicability(title, a)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BULK ENTRY ───────────────────────────────────────────────────────────────
function BulkEntry({ titles, allRatings, applicability, myUserId, myUsername, onSaveAll }) {
  const [localScores, setLocalScores] = useState({});
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = {};
    for (const { title } of titles) {
      const r = allRatings.find(r => r.user_id === myUserId && r.title === title);
      init[title] = r?.data || { scores: {}, version: "", status: null, notes: "", subcatNotes: {} };
    }
    setLocalScores(init);
  }, [titles, allRatings, myUserId]);

  const setScore = (title, cat, key, val) => {
    const v = val === "" ? undefined : Math.min(20, Math.max(0, Number(val)));
    setLocalScores(p => ({
      ...p,
      [title]: { ...p[title], scores: { ...p[title]?.scores, [cat]: { ...(p[title]?.scores?.[cat] || {}), [key]: v } } }
    }));
    setDirty(p => ({ ...p, [title]: true }));
  };

  const handleSave = async () => {
    setSaving(true);
    const changed = {};
    for (const title of Object.keys(dirty)) {
      if (dirty[title]) changed[title] = localScores[title];
    }
    await onSaveAll(changed);
    setDirty({});
    setSaving(false);
  };

  const dirtyCount = Object.values(dirty).filter(Boolean).length;

  return (
    <div style={{ padding: "24px 16px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={S.panelTitle}>BULK SCORE ENTRY</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            Tab between cells. Changes are highlighted. Hit Save All when done.
          </div>
        </div>
        <button style={{ ...S.primaryBtn, width: "auto", padding: "9px 24px",
          opacity: dirtyCount > 0 ? 1 : 0.4 }}
          onClick={handleSave} disabled={saving || dirtyCount === 0}>
          {saving ? "Saving..." : `Save All${dirtyCount > 0 ? ` (${dirtyCount} changed)` : ""}`}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...S.thCell, width: 140, textAlign: "left", position: "sticky", left: 0, background: "#0b1118", zIndex: 2 }}>
                TITLE
              </th>
              <th style={{ ...S.thCell, width: 60 }}>SCORE</th>
              {CATEGORIES.map(cat => (
                SUBCATEGORIES[cat].map(s => (
                  <th key={`${cat}:${s.key}`} style={S.thCell}>
                    <div style={{ fontSize: 9, color: "#60a5fa", letterSpacing: 1 }}>{cat.slice(0,3).toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "normal", wordBreak: "break-word" }}>{s.label}</div>
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {titles.map(({ title }) => {
              const data = localScores[title] || {};
              const titleApp = applicability[title] || {};
              const finalScore = calcFinalScore(data.scores, titleApp);
              const isDirty = dirty[title];
              return (
                <tr key={title} style={{ background: isDirty ? "#0f1e30" : "transparent" }}>
                  <td style={{ ...S.tdCell, position: "sticky", left: 0, background: isDirty ? "#0f1e30" : "#080d14",
                    zIndex: 1, fontWeight: 600, color: "#cbd5e1", borderRight: "2px solid #1e2d3d" }}>
                    {title}
                    {isDirty && <span style={{ fontSize: 9, color: "#f59e0b", marginLeft: 6 }}>●</span>}
                  </td>
                  <td style={{ ...S.tdCell, textAlign: "center", fontWeight: 700, color: scoreColor(finalScore),
                    borderRight: "2px solid #1e2d3d" }}>
                    {finalScore !== null ? finalScore.toFixed(2) : "—"}
                  </td>
                  {CATEGORIES.map(cat =>
                    SUBCATEGORIES[cat].map(s => {
                      const app = titleApp?.[cat]?.[s.key] ?? 1;
                      const sc = data.scores?.[cat]?.[s.key];
                      return (
                        <td key={`${cat}:${s.key}`} style={{ ...S.tdCell,
                          background: app === 0 ? "#0a0a0a" : undefined,
                          borderLeft: s.key === SUBCATEGORIES[cat][0].key ? "1px solid #1e2d3d" : undefined }}>
                          {app === 0
                            ? <span style={{ color: "#1e2d3d", fontSize: 10 }}>N/A</span>
                            : <input
                                className="grid-input"
                                type="number" min="0" max="20" step="0.5"
                                style={{ width: "100%", background: "none", border: "none",
                                  color: sc !== undefined ? scoreColor(Number(sc)) : "#334155",
                                  fontSize: 13, textAlign: "center", fontFamily: F,
                                  padding: "4px 2px", cursor: "text" }}
                                value={sc ?? ""}
                                placeholder="—"
                                onChange={e => setScore(title, cat, s.key, e.target.value)}
                              />
                          }
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INVITE CODE EDITOR ───────────────────────────────────────────────────────
function InviteCodeEditor({ current, onSave }) {
  const [val, setVal] = useState(current);
  useEffect(() => { setVal(current); }, [current]);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input style={{ ...S.input, marginBottom: 0, flex: 1 }}
        placeholder="Leave blank for open registration"
        value={val} onChange={e => setVal(e.target.value)} />
      <button style={{ ...S.primaryBtn, width: "auto", padding: "9px 18px" }}
        onClick={() => onSave(val)}>Save</button>
    </div>
  );
}

// ─── PASSWORD CHANGE MODAL ────────────────────────────────────────────────────
function PasswordChangeModal({ onSave, onClose }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    if (pw.length < 6) return setErr("At least 6 characters");
    if (pw !== confirm) return setErr("Passwords don't match");
    onSave(pw);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 340, background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 12, padding: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Change Password</div>
        <input type="password" style={S.input} placeholder="New password" value={pw} onChange={e => setPw(e.target.value)} />
        <input type="password" style={S.input} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {err && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.primaryBtn, flex: 1 }} onClick={handle}>Save</button>
          <button style={{ ...S.ghostBtn, flex: 1 }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── APPLICABILITY EDITOR ─────────────────────────────────────────────────────
function ApplicabilityEditor({ title, current, onSave }) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState(current);
  useEffect(() => { setVals(current); }, [current]);
  const set = (cat, key, v) => {
    setVals(p => ({ ...p, [cat]: { ...(p[cat] || {}), [key]: Math.min(1, Math.max(0, Number(v))) } }));
  };
  return (
    <div style={S.applicCard}>
      <div style={S.applicHeader} onClick={() => setOpen(o => !o)}>
        <span style={S.applicTitle}>{title}</span>
        <span style={{ color: "#60a5fa", fontSize: 12 }}>{open ? "▲" : "▼ edit"}</span>
      </div>
      {open && (
        <div style={S.applicBody}>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={S.applicCatLabel}>{cat}</div>
              {SUBCATEGORIES[cat].map(s => {
                const v = vals?.[cat]?.[s.key] ?? 1;
                return (
                  <div key={s.key} style={S.applicRow}>
                    <span style={S.applicSubLabel}>{s.label}</span>
                    <input type="number" min="0" max="1" step="0.1"
                      style={{ ...S.numInput, color: v < 1 ? "#fb923c" : "#e2e8f0", width: 60 }}
                      value={v} onChange={e => set(cat, s.key, e.target.value)} />
                  </div>
                );
              })}
            </div>
          ))}
          <button style={S.primaryBtn} onClick={() => { onSave(vals); setOpen(false); }}>Save</button>
        </div>
      )}
    </div>
  );
}

// ─── SUBCAT LEADERBOARD ───────────────────────────────────────────────────────
function SubcatLeaderboard({ subcat, rows, lbMode, setLbMode, onBack, onEditInline }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const commit = (title) => { onEditInline(title, editVal); setEditing(null); setEditVal(""); };
  return (
    <div style={S.app}>
      <style>{fontStyle}</style>
      <div style={S.header}>
        <button style={S.ghostBtn} onClick={onBack}>← Back</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={S.logoA}>{subcat.label.toUpperCase()}</span>
          <span style={{ ...S.logoB, marginLeft: 8 }}>{subcat.cat.toUpperCase()}</span>
        </div>
        <div style={S.modeToggle}>
          {["combined","individual"].map(m => (
            <button key={m} onClick={() => setLbMode(m)}
              style={{ ...S.modeBtn, ...(lbMode === m ? S.modeBtnActive : {}) }}>
              {m === "combined" ? "AVG" : "MINE"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: "32px auto", padding: "0 16px" }}>
        <div style={S.lbTable}>
          <div style={S.lbHeaderRow}>
            <span style={{ width: 36 }}>#</span>
            <span style={{ flex: 1 }}>Title</span>
            <span style={{ width: 80, textAlign: "center" }}>Apply</span>
            <span style={{ width: 110, textAlign: "right" }}>Score /20</span>
            {lbMode === "combined" && <span style={{ width: 70, textAlign: "right", fontSize: 11, color: "#64748b" }}>Mine</span>}
          </div>
          {rows.map((row, i) => {
            const score = lbMode === "combined" ? row.combined : row.myScore;
            const isEditing = editing === row.title;
            return (
              <div key={row.title} style={S.lbRow}>
                <span style={{ ...S.rank, color: i < 3 ? ["#f59e0b","#94a3b8","#cd7c3a"][i] : "#475569" }}>{i+1}</span>
                <span style={S.lbTitleText}>{row.title}</span>
                <span style={{ width: 80, textAlign: "center", fontSize: 12, color: row.app < 1 ? "#fb923c" : "#475569" }}>{row.app}x</span>
                {isEditing ? (
                  <div style={{ width: 110, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <input autoFocus type="number" min="0" max="20" step="0.5"
                      style={{ ...S.numInput, width: 60 }} value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") commit(row.title); if (e.key === "Escape") setEditing(null); }} />
                    <button style={S.approveBtn} onClick={() => commit(row.title)}>✓</button>
                  </div>
                ) : (
                  <div style={{ width: 110, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(score) }}>
                      {score !== null ? score.toFixed(1) : <span style={{ color: "#334155" }}>—</span>}
                    </span>
                    <button style={S.editDotBtn} onClick={() => { setEditing(row.title); setEditVal(row.myScore ?? ""); }}>✎</button>
                  </div>
                )}
                {lbMode === "combined" && !isEditing && (
                  <span style={{ width: 70, textAlign: "right", fontSize: 12, color: scoreColor(row.myScore) }}>
                    {row.myScore !== null ? row.myScore.toFixed(1) : "—"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─── TOOLTIP ──────────────────────────────────────────────────────────────────
function AnchorTooltip({ cat, subkey, label, isArc }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = React.useRef();
  // For arc mode, use ARC_ANCHOR_OVERRIDES first, then fall back to series ANCHORS
  const anchors = (isArc && ARC_ANCHOR_OVERRIDES[cat]?.[subkey])
    ? ARC_ANCHOR_OVERRIDES[cat][subkey]
    : ANCHORS[cat]?.[subkey] || [];

  const handleMouseEnter = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const tooltipHeight = 280; // approximate tooltip height
      const spaceBelow = window.innerHeight - rect.bottom;
      const flipUp = spaceBelow < tooltipHeight;
      setPos({
        top: flipUp
          ? rect.top + window.scrollY - tooltipHeight - 4
          : rect.bottom + window.scrollY + 4,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
        flipUp,
      });
    }
    setVisible(true);
  };

  return (
    <>
      <span ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        style={{ flex: 1, fontSize: 13, color: "#cbd5e1", cursor: "help",
          borderBottom: "1px dashed #334155", display: "inline-block" }}>
        {label}
      </span>
      {visible && anchors.length > 0 && (
        <div style={{
          position: "fixed",
          top: pos.top, left: pos.left,
          width: 320, background: "#0b1118",
          border: "1px solid #1e2d3d", borderRadius: 8,
          padding: "12px 14px", zIndex: 9999,
          boxShadow: pos.flipUp
            ? "0 -8px 32px rgba(0,0,0,0.6)"
            : "0 8px 32px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 8 }}>
            {label.toUpperCase()} — SCORING ANCHORS
          </div>
          {anchors.map(a => (
            <div key={a.range} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", width: 36, flexShrink: 0, paddingTop: 1 }}>
                {a.range}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{a.desc}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── RATING SHEET ─────────────────────────────────────────────────────────────
function RatingSheet({ title, data, applicability, onSave, onBack, isAdmin, onSaveApplicability }) {
  const [scores, setScores]           = useState(data.scores || {});
  const [version, setVersion]         = useState(data.version || "");
  const [status, setStatus]           = useState(data.status || null);
  const [notes, setNotes]             = useState(data.notes || "");
  const [subcatNotes, setSubcatNotes] = useState(data.subcatNotes || {});
  const [applic, setApplic]           = useState(applicability || {});
  const [dirty, setDirty]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [applicDirty, setApplicDirty] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  // Only sync applicability from admin changes — never reset scores from data prop
  useEffect(() => { setApplic(applicability || {}); }, [applicability]);

  const setScore = (cat, key, val) => {
    const v = val === "" ? undefined : Math.min(20, Math.max(0, Number(val)));
    setScores(p => ({ ...p, [cat]: { ...(p[cat] || {}), [key]: v } }));
    setDirty(true);
  };
  const setApp = (cat, key, val) => {
    setApplic(p => ({ ...p, [cat]: { ...(p[cat] || {}), [key]: Math.min(1, Math.max(0, Number(val))) } }));
    setApplicDirty(true);
  };
  const setSubcatNote = (cat, key, val) => {
    setSubcatNotes(p => ({ ...p, [`${cat}:${key}`]: val })); setDirty(true);
  };
  const toggleNote = (cat, key) => {
    const k = `${cat}:${key}`; setExpandedNotes(p => ({ ...p, [k]: !p[k] }));
  };
  const finalScore = calcFinalScore(scores, applic);

  return (
    <div style={S.app}>
      <style>{fontStyle}</style>
      <div style={S.header}>
        <button style={S.ghostBtn} onClick={onBack}>← Back</button>
        <div style={S.sheetTitleBlock}>
          <span style={S.logoA}>{title}</span>
          {finalScore !== null &&
            <span style={{ fontSize: 26, fontWeight: 800, color: scoreColor(finalScore), marginLeft: 16 }}>
              {finalScore.toFixed(3)}
            </span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && applicDirty &&
            <button style={{ ...S.primaryBtn, background: "#f59e0b", width: "auto", padding: "8px 18px" }}
              onClick={() => { onSaveApplicability(applic); setApplicDirty(false); }}>
              Save Applicability
            </button>}
          <button style={{ ...S.primaryBtn, width: "auto", padding: "8px 18px", opacity: (dirty && !saving) ? 1 : 0.4 }}
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({ scores, version, status, notes, subcatNotes });
                setDirty(false);
              } finally {
                setSaving(false);
              }
            }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div style={S.metaRow}>
        <div style={S.metaGroup}>
          <span style={S.metaLabel}>VERSION / FORM</span>
          <input style={{ ...S.input, width: 240, marginBottom: 0 }}
            placeholder="e.g. Manga, TYBW Anime"
            value={version} onChange={e => { setVersion(e.target.value); setDirty(true); }} />
        </div>
        <div style={S.metaGroup}>
          <span style={S.metaLabel}>STATUS</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COMPLETION_STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setDirty(true); }}
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, cursor: "pointer", border: "1px solid",
                  borderColor: status === s ? STATUS_COLORS[s] : "#1e2d3d",
                  color: status === s ? STATUS_COLORS[s] : "#475569",
                  background: status === s ? `${STATUS_COLORS[s]}18` : "none", fontFamily: F }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 28px", borderBottom: "1px solid #1e2d3d" }}>
        <div style={S.metaLabel}>OVERALL NOTES</div>
        <textarea style={{ ...S.input, marginBottom: 0, minHeight: 70, width: "100%", fontFamily: F, lineHeight: 1.5 }}
          placeholder="General thoughts on this title..."
          value={notes} onChange={e => { setNotes(e.target.value); setDirty(true); }} />
      </div>

      <div style={S.catSummaryRow}>
        {CATEGORIES.map(cat => {
          const cs = calcCategoryScore(cat, scores, applic);
          return (
            <div key={cat} style={S.catSummaryCard}>
              <span style={S.catSummaryLabel}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: cs !== null ? scoreColor(cs) : "#334155" }}>
                {cs !== null ? cs.toFixed(2) : "—"}
              </span>
              <span style={{ fontSize: 11, color: "#475569" }}>{(CATEGORY_WEIGHTS[cat]*100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      <div style={S.catGrid}>
        {CATEGORIES.map(cat => (
          <div key={cat} style={S.catBlock}>
            <div style={S.catBlockHead}>
              <span style={S.catBlockTitle}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{(CATEGORY_WEIGHTS[cat]*100).toFixed(0)}%</span>
            </div>
            <div style={S.subTable}>
              <div style={S.subTableHead}>
                <span style={{ flex: 1 }}>Subcategory</span>
                <span style={{ width: 75, textAlign: "center" }}>Score</span>
                <span style={{ width: 75, textAlign: "center" }}>Apply</span>
                <span style={{ width: 44, textAlign: "center" }}>Wt</span>
                <span style={{ width: 28 }}></span>
              </div>
              {SUBCATEGORIES[cat].map(s => {
                const app = applic?.[cat]?.[s.key] ?? 1;
                const sc  = scores?.[cat]?.[s.key];
                const noteKey = `${cat}:${s.key}`;
                const noteOpen = expandedNotes[noteKey];
                const hasNote = subcatNotes[noteKey]?.trim();
                return (
                  <div key={s.key}>
                    <div style={S.subRow}>
                      <AnchorTooltip cat={cat} subkey={s.key} label={s.label} />
                      <input type="number" min="0" max="20" step="0.5"
                        style={S.numInput} value={sc ?? ""} placeholder="—"
                        onChange={e => setScore(cat, s.key, e.target.value)} />
                      <input type="number" min="0" max="1" step="0.1"
                        disabled={!isAdmin}
                        style={{ ...S.numInput, color: app < 1 ? "#fb923c" : "#64748b",
                          cursor: isAdmin ? "text" : "not-allowed", opacity: isAdmin ? 1 : 0.6 }}
                        value={app} onChange={e => isAdmin && setApp(cat, s.key, e.target.value)} />
                      <span style={{ width: 44, textAlign: "center", fontSize: 11, color: "#475569" }}>
                        {(s.weight*100).toFixed(0)}%
                      </span>
                      <button onClick={() => toggleNote(cat, s.key)}
                        style={{ width: 28, background: "none", border: "none", cursor: "pointer",
                          color: hasNote ? "#60a5fa" : "#334155", fontSize: 14, padding: 0, fontFamily: F }}>✎</button>
                    </div>
                    {noteOpen && (
                      <div style={{ padding: "4px 8px 8px", background: "#0b1118" }}>
                        <textarea
                          style={{ ...S.input, marginBottom: 0, minHeight: 52, width: "100%", fontSize: 12, fontFamily: F, lineHeight: 1.4 }}
                          placeholder={`Notes on ${s.label}...`}
                          value={subcatNotes[noteKey] || ""}
                          onChange={e => setSubcatNote(cat, s.key, e.target.value)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ form, setForm, onSubmit, loading }) {
  return (
    <div style={S.center}>
      <style>{fontStyle}</style>
      <div style={S.loginCard}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={S.logoA}>ANIMANGA</div>
          <div style={S.logoB}>RATER</div>
        </div>
        {form.isNew && (
          <input style={S.input} placeholder="Username"
            value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
        )}
        <input style={S.input} placeholder="Email"
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <input style={S.input} placeholder="Password" type="password"
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          onKeyDown={e => !form.isNew && e.key === "Enter" && onSubmit()} />
        {form.isNew && (
          <input style={S.input} placeholder="Invite code"
            value={form.inviteCode} onChange={e => setForm(p => ({ ...p, inviteCode: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && onSubmit()} />
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[false,true].map(isNew => (
            <button key={String(isNew)} onClick={() => setForm(p => ({ ...p, isNew }))}
              style={{ ...S.modeBtn, flex: 1, ...(form.isNew === isNew ? S.modeBtnActive : {}) }}>
              {isNew ? "REGISTER" : "LOGIN"}
            </button>
          ))}
        </div>
        <button style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }} onClick={onSubmit} disabled={loading}>
          {loading ? "Please wait..." : form.isNew ? "Create Account" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 20px",
      fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: F, borderRadius: 8,
      background: type === "err" ? "#ef4444" : "#22c55e" }}>{msg}</div>
  );
}
function Spinner() {
  return <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #1e2533", borderTop: "3px solid #60a5fa" }} />;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "#0f1623", color: "#e2e8f0", fontFamily: F },
  center: { minHeight: "100vh", background: "#0f1623", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F },
  header: { display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", background: "#0b1118", position: "sticky", top: 0, zIndex: 100 },
  headerLogo: { display: "flex", alignItems: "baseline", gap: 6 },
  logoA: { fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: 1, fontFamily: F },
  logoB: { fontSize: 18, fontWeight: 800, color: "#60a5fa", letterSpacing: 1, fontFamily: F },
  headerTabs: { flex: 1, display: "flex", justifyContent: "center", gap: 4 },
  headerTab: { background: "none", border: "none", color: "#475569", padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 1, fontFamily: F, borderRadius: 6 },
  headerTabActive: { background: "#1e2d3d", color: "#e2e8f0" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  headerUser: { fontSize: 13, color: "#64748b", fontWeight: 500 },
  ghostBtn: { background: "none", border: "1px solid #1e2d3d", color: "#64748b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: F, borderRadius: 6 },
  pageWrap: { display: "flex", gap: 16, maxWidth: 1100, margin: "28px auto", padding: "0 16px", alignItems: "flex-start" },
  leaderWrap: { flex: 1, minWidth: 0, background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 10 },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1e2d3d" },
  panelTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa" },
  modeToggle: { display: "flex", gap: 4 },
  modeBtn: { background: "none", border: "1px solid #1e2d3d", color: "#475569", padding: "5px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: F, borderRadius: 6 },
  modeBtnActive: { background: "#1e2d3d", borderColor: "#60a5fa", color: "#60a5fa" },
  lbTable: { padding: "8px 0" },
  lbHeaderRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 20px", fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: 1, borderBottom: "1px solid #1a2535" },
  lbRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #131d2e" },
  rank: { width: 36, fontSize: 13, fontWeight: 700 },
  lbTitleText: { flex: 1, fontSize: 15, fontWeight: 500, color: "#cbd5e1" },
  sidebar: { width: 270, display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 10, padding: 18 },
  cardLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 12 },
  input: { width: "100%", background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "9px 12px", fontSize: 13, marginBottom: 10, fontFamily: F, borderRadius: 6, outline: "none" },
  primaryBtn: { width: "100%", background: "#3b82f6", border: "none", color: "#fff", padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: F, borderRadius: 6 },
  userRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a2535" },
  userName: { fontSize: 13, color: "#94a3b8", fontWeight: 500 },
  userCount: { fontSize: 12, color: "#334155" },
  subcatPage: { maxWidth: 1100, margin: "0 auto", padding: "28px 16px" },
  subcatPageHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  subcatCatBlock: { marginBottom: 32 },
  subcatCatLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#60a5fa", marginBottom: 12 },
  subcatCardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
  subcatCard: { background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 8, padding: 14, cursor: "pointer" },
  subcatCardLabel: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 },
  subcatCardWeight: { fontSize: 11, color: "#475569", marginBottom: 10 },
  subcatEmpty: { fontSize: 12, color: "#334155", padding: "8px 0" },
  subcatMiniRow: { display: "flex", alignItems: "center", gap: 8, padding: "3px 0" },
  subcatMiniTitle: { flex: 1, fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subcatCardFooter: { fontSize: 11, color: "#334155", marginTop: 8, textAlign: "right" },
  adminPage: { maxWidth: 900, margin: "28px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 },
  noAdmin: { color: "#64748b", textAlign: "center", padding: 40, fontSize: 15 },
  adminHint: { fontSize: 13, color: "#475569", marginBottom: 16, lineHeight: 1.5 },
  applicGrid: { display: "flex", flexDirection: "column", gap: 8 },
  applicCard: { background: "#0b1118", border: "1px solid #1e2d3d", borderRadius: 8 },
  applicHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" },
  applicTitle: { fontSize: 14, fontWeight: 600, color: "#cbd5e1" },
  applicBody: { padding: "0 16px 16px" },
  applicCatLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 6 },
  applicRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" },
  applicSubLabel: { fontSize: 13, color: "#94a3b8" },
  pendingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2535" },
  pendingTitle: { fontSize: 14, color: "#cbd5e1", fontWeight: 500 },
  pendingMeta: { fontSize: 11, color: "#475569", marginTop: 2 },
  approveBtn: { background: "#14532d", border: "1px solid #166534", color: "#4ade80", padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 5 },
  rejectBtn: { background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171", padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 5 },
  editDotBtn: { background: "none", border: "1px solid #1e2d3d", color: "#475569", width: 26, height: 26, cursor: "pointer", fontSize: 13, borderRadius: 4, fontFamily: F },
  sheetTitleBlock: { flex: 1, display: "flex", alignItems: "baseline", gap: 8 },
  metaRow: { display: "flex", gap: 24, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", flexWrap: "wrap", alignItems: "flex-start" },
  metaGroup: { display: "flex", flexDirection: "column", gap: 6 },
  metaLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 },
  catSummaryRow: { display: "flex", borderBottom: "1px solid #1e2d3d" },
  catSummaryCard: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", gap: 3, borderRight: "1px solid #1e2d3d" },
  catSummaryLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#475569" },
  catGrid: { display: "grid", gridTemplateColumns: "1fr 1fr" },
  catBlock: { borderRight: "1px solid #1e2d3d", borderBottom: "1px solid #1e2d3d" },
  catBlockHead: { display: "flex", justifyContent: "space-between", padding: "10px 18px", background: "#0b1118", borderBottom: "1px solid #1e2d3d" },
  catBlockTitle: { fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#60a5fa" },
  subTable: { padding: "8px 18px 14px" },
  subTableHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: 1, padding: "5px 0", borderBottom: "1px solid #1a2535", marginBottom: 4 },
  subRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f1a2a" },
  numInput: { width: 75, background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "5px 6px", fontSize: 13, textAlign: "center", fontFamily: F, borderRadius: 5, outline: "none" },
  loginCard: { width: 360, background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column" },
  thCell: { padding: "8px 6px", background: "#0b1118", color: "#475569", fontWeight: 600, letterSpacing: 1, textAlign: "center", borderBottom: "2px solid #1e2d3d", borderRight: "1px solid #1a2535", whiteSpace: "normal", width: 80, minWidth: 80 },
  tdCell: { padding: "6px", borderBottom: "1px solid #0f1a2a", borderRight: "1px solid #0f1a2a", textAlign: "center", width: 80, minWidth: 80 },
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
function UserProfile({ user, titles, allRatings, applicability, myUserId, myUsername, onBack, onViewTitle, lbMode, setLbMode }) {
  const F = "'Inter', system-ui, sans-serif";

  const getRows = () => titles.map(({ title }) => {
    const titleApp = applicability[title] || {};
    const theirRating = allRatings.find(r => r.user_id === user.userId && r.title === title);
    const myRating = allRatings.find(r => r.user_id === myUserId && r.title === title);
    const theirScore = theirRating ? calcFinalScore(theirRating.data?.scores, titleApp) : null;
    const myScore = myRating ? calcFinalScore(myRating.data?.scores, titleApp) : null;
    const divergence = theirScore !== null && myScore !== null ? myScore - theirScore : null;
    const theirStatus = theirRating?.data?.status || null;
    return { title, theirScore, myScore, divergence, theirStatus, ratedBy: theirScore !== null ? 1 : 0 };
  }).sort((a, b) => {
    if (a.theirScore === null && b.theirScore === null) return 0;
    if (a.theirScore === null) return 1;
    if (b.theirScore === null) return -1;
    return b.theirScore - a.theirScore;
  });

  const rows = getRows();
  const ratedCount = rows.filter(r => r.theirScore !== null).length;
  const avgScore = ratedCount > 0
    ? rows.filter(r => r.theirScore !== null).reduce((s, r) => s + r.theirScore, 0) / ratedCount
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1623", color: "#e2e8f0", fontFamily: F, margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", background: "#0b1118", position: "sticky", top: 0, zIndex: 100, margin: 0 }}>
        <button style={{ background: "none", border: "1px solid #1e2d3d", color: "#64748b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 6 }} onClick={onBack}>← Back</button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{user.username}</span>
          <span style={{ fontSize: 13, color: "#475569", marginLeft: 12 }}>{ratedCount} titles rated</span>
          {avgScore !== null && <span style={{ fontSize: 13, color: scoreColor(avgScore), marginLeft: 12, fontWeight: 700 }}>avg {avgScore.toFixed(2)}</span>}
        </div>
      </div>

      <div style={{ padding: "0" }}>
        <div style={{ background: "transparent", border: "none", borderRadius: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 12px 28px", borderBottom: "1px solid #1e2d3d" }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa" }}>{user.username.toUpperCase()}'S RANKINGS</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 28px", fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: 1, borderBottom: "1px solid #1a2535" }}>
              <span style={{ width: 36 }}>#</span>
              <span style={{ flex: 1 }}>Title</span>
              <span style={{ width: 100 }}>Status</span>
              <span style={{ width: 80, textAlign: "right" }}>Score</span>
              <span style={{ width: 70, textAlign: "right" }}>Mine</span>
              <span style={{ width: 70, textAlign: "right" }}>Diff</span>
            </div>
            {rows.map((row, i) => (
              <div key={row.title}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 28px", borderBottom: "1px solid #1a2535", cursor: row.theirScore !== null ? "pointer" : "default" }}
                onClick={() => row.theirScore !== null && onViewTitle(row.title)}>
                <span style={{ width: 36, fontSize: 13, fontWeight: 700, color: row.theirScore !== null ? (i < 3 ? ["#f59e0b","#94a3b8","#cd7c3a"][i] : "#475569") : "#1e2d3d" }}>{row.theirScore !== null ? i + 1 : "—"}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: row.theirScore !== null ? "#cbd5e1" : "#334155" }}>{row.title}</span>
                <span style={{ width: 100 }}>
                  {row.theirStatus && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLORS[row.theirStatus], background: `${STATUS_COLORS[row.theirStatus]}18`, padding: "2px 8px", borderRadius: 20 }}>
                      {row.theirStatus}
                    </span>
                  )}
                </span>
                <span style={{ width: 80, textAlign: "right", fontSize: 18, fontWeight: 700, color: scoreColor(row.theirScore) }}>
                  {row.theirScore !== null ? row.theirScore.toFixed(2) : <span style={{ color: "#334155" }}>—</span>}
                </span>
                <span style={{ width: 70, textAlign: "right", fontSize: 12, color: scoreColor(row.myScore) }}>
                  {row.myScore !== null ? row.myScore.toFixed(1) : "—"}
                </span>
                <span style={{ width: 70, textAlign: "right", fontSize: 12, fontWeight: Math.abs(row.divergence || 0) > 2 ? 700 : 400,
                  color: row.divergence !== null ? (row.divergence > 0 ? "#34d399" : "#f87171") : "#334155" }}>
                  {row.divergence !== null ? `${row.divergence > 0 ? "+" : ""}${row.divergence.toFixed(1)}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USER RATING SHEET (read-only) ────────────────────────────────────────────
function UserRatingSheet({ title, data, applicability, username, myData, onBack, onCompare }) {
  const F = "'Inter', system-ui, sans-serif";
  const scores = data.scores || {};
  const applic = applicability || {};
  const finalScore = calcFinalScore(scores, applic);
  const myFinalScore = myData ? calcFinalScore(myData.scores, applic) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1623", color: "#e2e8f0", fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", background: "#0b1118", position: "sticky", top: 0, zIndex: 100 }}>
        <button style={{ background: "none", border: "1px solid #1e2d3d", color: "#64748b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 6 }} onClick={onBack}>← Back</button>
        <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{title}</span>
          <span style={{ fontSize: 13, color: "#475569" }}>rated by {username}</span>
          {finalScore !== null && <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor(finalScore), marginLeft: 8 }}>{finalScore.toFixed(3)}</span>}
          {myFinalScore !== null && <span style={{ fontSize: 13, color: "#475569" }}>· yours: <span style={{ color: scoreColor(myFinalScore), fontWeight: 700 }}>{myFinalScore.toFixed(2)}</span></span>}
        </div>
        {myData && (
          <button style={{ background: "#1e2d3d", border: "1px solid #3b82f6", color: "#60a5fa", padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F, borderRadius: 6 }}
            onClick={onCompare}>⇄ Compare</button>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 24, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", flexWrap: "wrap" }}>
        {data.version && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>VERSION</div><div style={{ fontSize: 13, color: "#94a3b8" }}>{data.version}</div></div>}
        {data.status && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>STATUS</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[data.status], background: `${STATUS_COLORS[data.status]}18`, padding: "3px 10px", borderRadius: 20 }}>{data.status}</span></div>}
        {data.notes && <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>NOTES</div><div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{data.notes}</div></div>}
      </div>

      {/* Cat summary */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d" }}>
        {CATEGORIES.map(cat => {
          const cs = calcCategoryScore(cat, scores, applic);
          const myCs = myData ? calcCategoryScore(cat, myData.scores, applic) : null;
          return (
            <div key={cat} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", gap: 3, borderRight: "1px solid #1e2d3d" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#475569" }}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: cs !== null ? scoreColor(cs) : "#334155" }}>{cs !== null ? cs.toFixed(2) : "—"}</span>
              {myCs !== null && <span style={{ fontSize: 11, color: "#475569" }}>you: <span style={{ color: scoreColor(myCs) }}>{myCs.toFixed(1)}</span></span>}
            </div>
          );
        })}
      </div>

      {/* Subcategory grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {CATEGORIES.map(cat => (
          <div key={cat} style={{ borderRight: "1px solid #1e2d3d", borderBottom: "1px solid #1e2d3d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", background: "#0b1118", borderBottom: "1px solid #1e2d3d" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#60a5fa" }}>{cat.toUpperCase()}</span>
            </div>
            <div style={{ padding: "8px 18px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, color: "#334155", padding: "5px 0", borderBottom: "1px solid #1a2535", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>Subcategory</span>
                <span style={{ width: 70, textAlign: "center" }}>{username}</span>
                <span style={{ width: 70, textAlign: "center" }}>Mine</span>
                <span style={{ width: 44, textAlign: "center" }}>Wt</span>
              </div>
              {SUBCATEGORIES[cat].map(s => {
                const app = applic?.[cat]?.[s.key] ?? 1;
                const sc = scores?.[cat]?.[s.key];
                const mySc = myData?.scores?.[cat]?.[s.key];
                const diff = (sc !== undefined && sc !== null && mySc !== undefined && mySc !== null)
                  ? Number(sc) - Number(mySc) : null;
                const noteKey = `${cat}:${s.key}`;
                const note = data.subcatNotes?.[noteKey];
                return (
                  <div key={s.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f1a2a" }}>
                      <span style={{ flex: 1, fontSize: 13, color: app === 0 ? "#334155" : "#cbd5e1" }}>{s.label}{app < 1 && app > 0 ? <span style={{ fontSize: 10, color: "#fb923c", marginLeft: 4 }}>{app}x</span> : null}</span>
                      <span style={{ width: 70, textAlign: "center", fontSize: 13, fontWeight: 700, color: scoreColor(sc !== undefined ? Number(sc) : null) }}>
                        {sc !== undefined && sc !== null ? Number(sc) : <span style={{ color: "#334155" }}>—</span>}
                      </span>
                      <span style={{ width: 70, textAlign: "center", fontSize: 13, color: scoreColor(mySc !== undefined ? Number(mySc) : null) }}>
                        {mySc !== undefined && mySc !== null ? Number(mySc) : <span style={{ color: "#1e2d3d" }}>—</span>}
                      </span>
                      <span style={{ width: 44, textAlign: "center", fontSize: 11, color: "#475569" }}>{(s.weight*100).toFixed(0)}%</span>
                    </div>
                    {note && (
                      <div style={{ padding: "3px 8px 6px", background: "#0b1118", fontSize: 11, color: "#64748b", fontStyle: "italic", lineHeight: 1.4 }}>{note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TITLE COMPARISON ─────────────────────────────────────────────────────────
function TitleComparison({ title, myData, theirData, applicability, myUsername, theirUsername, onBack }) {
  const F = "'Inter', system-ui, sans-serif";
  const applic = applicability || {};
  const myScores = myData.scores || {};
  const theirScores = theirData.scores || {};
  const myFinal = calcFinalScore(myScores, applic);
  const theirFinal = calcFinalScore(theirScores, applic);

  return (
    <div style={{ minHeight: "100vh", background: "#0f1623", color: "#e2e8f0", fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", background: "#0b1118", position: "sticky", top: 0, zIndex: 100 }}>
        <button style={{ background: "none", border: "1px solid #1e2d3d", color: "#64748b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 6 }} onClick={onBack}>← Back</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{title}</span>
          <span style={{ fontSize: 13, color: "#475569", marginLeft: 12 }}>comparison</span>
        </div>
      </div>

      {/* Final score comparison */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d" }}>
        {[{ username: myUsername, final: myFinal, scores: myScores }, { username: theirUsername, final: theirFinal, scores: theirScores }].map((u, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 8px", borderRight: i === 0 ? "1px solid #1e2d3d" : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#475569", marginBottom: 6 }}>{u.username.toUpperCase()}</span>
            <span style={{ fontSize: 32, fontWeight: 800, color: scoreColor(u.final) }}>{u.final !== null ? u.final.toFixed(3) : "—"}</span>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {CATEGORIES.map(cat => {
                const cs = calcCategoryScore(cat, u.scores, applic);
                return (
                  <div key={cat} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>{cat.slice(0,3).toUpperCase()}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(cs) }}>{cs !== null ? cs.toFixed(1) : "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Subcategory comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {CATEGORIES.map(cat => (
          <div key={cat} style={{ borderRight: "1px solid #1e2d3d", borderBottom: "1px solid #1e2d3d" }}>
            <div style={{ padding: "10px 18px", background: "#0b1118", borderBottom: "1px solid #1e2d3d" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#60a5fa" }}>{cat.toUpperCase()}</span>
            </div>
            <div style={{ padding: "8px 18px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, color: "#334155", padding: "5px 0", borderBottom: "1px solid #1a2535", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>Subcategory</span>
                <span style={{ width: 55, textAlign: "center" }}>{myUsername.slice(0,6)}</span>
                <span style={{ width: 55, textAlign: "center" }}>{theirUsername.slice(0,6)}</span>
                <span style={{ width: 44, textAlign: "center" }}>Diff</span>
              </div>
              {SUBCATEGORIES[cat].map(s => {
                const app = applic?.[cat]?.[s.key] ?? 1;
                const mySc = myScores?.[cat]?.[s.key];
                const theirSc = theirScores?.[cat]?.[s.key];
                const diff = (mySc !== undefined && mySc !== null && theirSc !== undefined && theirSc !== null)
                  ? Number(mySc) - Number(theirSc) : null;
                return (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f1a2a" }}>
                    <span style={{ flex: 1, fontSize: 12, color: app === 0 ? "#334155" : "#cbd5e1" }}>{s.label}</span>
                    <span style={{ width: 55, textAlign: "center", fontSize: 13, fontWeight: 700, color: scoreColor(mySc !== undefined ? Number(mySc) : null) }}>
                      {mySc !== undefined && mySc !== null ? Number(mySc) : <span style={{ color: "#334155" }}>—</span>}
                    </span>
                    <span style={{ width: 55, textAlign: "center", fontSize: 13, fontWeight: 700, color: scoreColor(theirSc !== undefined ? Number(theirSc) : null) }}>
                      {theirSc !== undefined && theirSc !== null ? Number(theirSc) : <span style={{ color: "#334155" }}>—</span>}
                    </span>
                    <span style={{ width: 44, textAlign: "center", fontSize: 12, fontWeight: Math.abs(diff || 0) >= 2 ? 700 : 400,
                      color: diff !== null ? (diff > 0 ? "#34d399" : diff < 0 ? "#f87171" : "#475569") : "#1e2d3d" }}>
                      {diff !== null ? (diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ARC LEADERBOARD ──────────────────────────────────────────────────────────
function ArcLeaderboard({ arcs, allArcRatings, arcLeaderboard, lbMode, setLbMode, onViewArc, onSuggest, myUserId, titles }) {
  const F = "'Inter', system-ui, sans-serif";
  const [suggestForm, setSuggestForm] = useState({ title: "", arcName: "" });

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ display: "flex", gap: 16, maxWidth: 1100, margin: "28px auto", padding: "0 16px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1e2d3d" }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#60a5fa" }}>ARC RANKINGS</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["combined","individual"].map(m => (
                <button key={m} onClick={() => setLbMode(m)}
                  style={{ background: "none", border: "1px solid #1e2d3d", color: lbMode === m ? "#60a5fa" : "#475569",
                    padding: "5px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: F, borderRadius: 6,
                    ...(lbMode === m ? { background: "#1e2d3d", borderColor: "#60a5fa" } : {}) }}>
                  {m === "combined" ? "AVG" : "MINE"}
                </button>
              ))}
            </div>
          </div>

          {arcs.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 14 }}>
              No arcs yet — suggest one using the panel on the right.
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 20px", fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: 1, borderBottom: "1px solid #1a2535" }}>
                <span style={{ width: 36 }}>#</span>
                <span style={{ width: 160 }}>Series</span>
                <span style={{ flex: 1 }}>Arc</span>
                <span style={{ width: 80, textAlign: "right" }}>Score</span>
                {lbMode === "combined" && <span style={{ width: 60, textAlign: "right", fontSize: 11, color: "#64748b" }}>Mine</span>}
                <span style={{ width: 70, textAlign: "right" }}>Ratings</span>
              </div>
              {arcLeaderboard.map((row, i) => {
                const score = lbMode === "combined" ? row.combined : row.myScore;
                return (
                  <div key={row.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #131d2e" }}
                    onClick={() => onViewArc(row)}>
                    <span style={{ width: 36, fontSize: 13, fontWeight: 700, color: i < 3 ? ["#f59e0b","#94a3b8","#cd7c3a"][i] : "#475569" }}>{i+1}</span>
                    <span style={{ width: 160, fontSize: 12, color: "#475569" }}>{row.title}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#cbd5e1" }}>{row.arc_name}</span>
                    <span style={{ width: 80, textAlign: "right", fontSize: 18, fontWeight: 700, color: scoreColor(score) }}>
                      {score !== null ? score.toFixed(2) : <span style={{ color: "#334155" }}>—</span>}
                    </span>
                    {lbMode === "combined" && (
                      <span style={{ width: 60, textAlign: "right", fontSize: 12, color: scoreColor(row.myScore) }}>
                        {row.myScore !== null ? row.myScore.toFixed(1) : "—"}
                      </span>
                    )}
                    <span style={{ width: 70, textAlign: "right", fontSize: 12, color: "#475569" }}>
                      {row.ratedBy} user{row.ratedBy !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ width: 270, display: "flex", flexDirection: "column", gap: 12 }}>
          <ArcSuggestPanel titles={titles} onSuggest={onSuggest} />
        </div>
      </div>
    </div>
  );
}

// ─── ARC RATING SHEET ─────────────────────────────────────────────────────────
function ArcRatingSheet({ arc, data, applicability, onSave, onSaveApplicability, onBack, isAdmin }) {
  const F = "'Inter', system-ui, sans-serif";
  const [scores, setScores]           = useState(data.scores || {});
  const [version, setVersion]         = useState(data.version || "");
  const [status, setStatus]           = useState(data.status || null);
  const [notes, setNotes]             = useState(data.notes || "");
  const [subcatNotes, setSubcatNotes] = useState(data.subcatNotes || {});
  const [applic, setApplic]           = useState(applicability || {});
  const [dirty, setDirty]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [applicDirty, setApplicDirty] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => { setApplic(applicability || {}); }, [applicability]);

  const setScore = (cat, key, val) => {
    const v = val === "" ? undefined : Math.min(20, Math.max(0, Number(val)));
    setScores(p => ({ ...p, [cat]: { ...(p[cat] || {}), [key]: v } }));
    setDirty(true);
  };
  const setSubcatNote = (cat, key, val) => {
    setSubcatNotes(p => ({ ...p, [`${cat}:${key}`]: val })); setDirty(true);
  };
  const toggleNote = (cat, key) => {
    const k = `${cat}:${key}`; setExpandedNotes(p => ({ ...p, [k]: !p[k] }));
  };

  const finalScore = calcFinalScore(scores, applic, ARC_CATEGORY_WEIGHTS, ARC_SUBCATEGORIES);

  return (
    <div style={{ minHeight: "100vh", background: "#0f1623", color: "#e2e8f0", fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", background: "#0b1118", position: "sticky", top: 0, zIndex: 100 }}>
        <button style={{ background: "none", border: "1px solid #1e2d3d", color: "#64748b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: F, borderRadius: 6 }} onClick={onBack}>← Back</button>
        <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#475569" }}>{arc.title}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginLeft: 4 }}>{arc.arc_name}</span>
          {finalScore !== null &&
            <span style={{ fontSize: 26, fontWeight: 800, color: scoreColor(finalScore), marginLeft: 16 }}>
              {finalScore.toFixed(3)}
            </span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && applicDirty && (
            <button style={{ background: "#f59e0b", border: "none", color: "#fff", padding: "8px 18px",
              cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: F, borderRadius: 6 }}
              onClick={() => { onSaveApplicability(applic); setApplicDirty(false); }}>
              Save Applicability
            </button>
          )}
          <button style={{ background: "#3b82f6", border: "none", color: "#fff", padding: "8px 18px",
            cursor: saving || !dirty ? "default" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: F, borderRadius: 6,
            opacity: (dirty && !saving) ? 1 : 0.4 }}
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              try { await onSave({ scores, version, status, notes, subcatNotes }); setDirty(false); }
              finally { setSaving(false); }
            }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 24, padding: "14px 28px", borderBottom: "1px solid #1e2d3d", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>VERSION / FORM</span>
          <input style={{ width: 240, background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "9px 12px", fontSize: 13, fontFamily: F, borderRadius: 6, outline: "none" }}
            placeholder="e.g. Anime, Manga"
            value={version} onChange={e => { setVersion(e.target.value); setDirty(true); }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>STATUS</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COMPLETION_STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setDirty(true); }}
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, cursor: "pointer", border: "1px solid",
                  borderColor: status === s ? STATUS_COLORS[s] : "#1e2d3d",
                  color: status === s ? STATUS_COLORS[s] : "#475569",
                  background: status === s ? `${STATUS_COLORS[s]}18` : "none", fontFamily: F }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 28px", borderBottom: "1px solid #1e2d3d" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 4 }}>OVERALL NOTES</div>
        <textarea style={{ width: "100%", background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "9px 12px", fontSize: 13, fontFamily: F, borderRadius: 6, outline: "none", minHeight: 70, lineHeight: 1.5 }}
          placeholder="General thoughts on this arc..."
          value={notes} onChange={e => { setNotes(e.target.value); setDirty(true); }} />
      </div>

      {/* Cat summary */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d" }}>
        {ARC_CATEGORIES.map(cat => {
          const cs = calcCategoryScore(cat, scores, applic, ARC_SUBCATEGORIES);
          return (
            <div key={cat} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", gap: 3, borderRight: "1px solid #1e2d3d" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#475569" }}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: cs !== null ? scoreColor(cs) : "#334155" }}>
                {cs !== null ? cs.toFixed(2) : "—"}
              </span>
              <span style={{ fontSize: 11, color: "#475569" }}>{(ARC_CATEGORY_WEIGHTS[cat]*100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      {/* Subcategory grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {ARC_CATEGORIES.map(cat => (
          <div key={cat} style={{ borderRight: "1px solid #1e2d3d", borderBottom: "1px solid #1e2d3d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", background: "#0b1118", borderBottom: "1px solid #1e2d3d" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#60a5fa" }}>{cat.toUpperCase()}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{(ARC_CATEGORY_WEIGHTS[cat]*100).toFixed(0)}%</span>
            </div>
            <div style={{ padding: "8px 18px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: 1, padding: "5px 0", borderBottom: "1px solid #1a2535", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>Subcategory</span>
                <span style={{ width: 75, textAlign: "center" }}>Score</span>
                <span style={{ width: 75, textAlign: "center" }}>Apply</span>
                <span style={{ width: 44, textAlign: "center" }}>Wt</span>
                <span style={{ width: 28 }}></span>
              </div>
              {ARC_SUBCATEGORIES[cat].map(s => {
                const app = applic?.[cat]?.[s.key] ?? 1;
                const sc  = scores?.[cat]?.[s.key];
                const noteKey = `${cat}:${s.key}`;
                const noteOpen = expandedNotes[noteKey];
                const hasNote = subcatNotes[noteKey]?.trim();
                return (
                  <div key={s.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f1a2a" }}>
                      <AnchorTooltip cat={cat} subkey={s.key} label={s.label} isArc={true} />
                      <input type="number" min="0" max="20" step="0.5"
                        style={{ width: 75, background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "5px 6px", fontSize: 13, textAlign: "center", fontFamily: F, borderRadius: 5, outline: "none" }}
                        value={sc ?? ""} placeholder="—"
                        onChange={e => setScore(cat, s.key, e.target.value)} />
                      <input type="number" min="0" max="1" step="0.1"
                        disabled={!isAdmin}
                        style={{ width: 75, background: "#0b1118", border: "1px solid #1e2d3d", color: app < 1 ? "#fb923c" : "#64748b", padding: "5px 6px", fontSize: 13, textAlign: "center", fontFamily: F, borderRadius: 5, outline: "none", cursor: isAdmin ? "text" : "not-allowed", opacity: isAdmin ? 1 : 0.6 }}
                        value={app} onChange={e => { if (!isAdmin) return; setApplic(p => ({ ...p, [cat]: { ...(p[cat]||{}), [s.key]: Math.min(1,Math.max(0,Number(e.target.value))) } })); setApplicDirty(true); }} />
                      <span style={{ width: 44, textAlign: "center", fontSize: 11, color: "#475569" }}>{(s.weight*100).toFixed(0)}%</span>
                      <button onClick={() => toggleNote(cat, s.key)}
                        style={{ width: 28, background: "none", border: "none", cursor: "pointer", color: hasNote ? "#60a5fa" : "#334155", fontSize: 14, padding: 0, fontFamily: F }}>✎</button>
                    </div>
                    {noteOpen && (
                      <div style={{ padding: "4px 8px 8px", background: "#0b1118" }}>
                        <textarea
                          style={{ width: "100%", background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0", padding: "7px 10px", fontSize: 12, fontFamily: F, borderRadius: 5, outline: "none", minHeight: 52, lineHeight: 1.4 }}
                          placeholder={`Notes on ${s.label}...`}
                          value={subcatNotes[noteKey] || ""}
                          onChange={e => setSubcatNote(cat, s.key, e.target.value)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ARC SUGGEST PANEL ────────────────────────────────────────────────────────
function ArcSuggestPanel({ titles, onSuggest }) {
  const F = "'Inter', system-ui, sans-serif";
  const [lockedTitle, setLockedTitle] = useState(null);
  const [arcName, setArcName] = useState("");
  const [submitted, setSubmitted] = useState([]);

  const handleSubmit = () => {
    if (!arcName.trim() || !lockedTitle) return;
    onSuggest(lockedTitle, arcName.trim());
    setSubmitted(p => [...p, arcName.trim()]);
    setArcName("");
  };

  const handleUnlock = () => {
    setLockedTitle(null);
    setSubmitted([]);
    setArcName("");
  };

  return (
    <div style={{ background: "#131d2e", border: "1px solid #1e2d3d", borderRadius: 10, padding: 18, fontFamily: F }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#60a5fa", marginBottom: 12 }}>SUGGEST ARC</div>

      {!lockedTitle ? (
        <>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Select a series to start adding arcs</div>
          {titles.map(t => (
            <div key={t.title}
              onClick={() => setLockedTitle(t.title)}
              style={{ padding: "9px 12px", marginBottom: 4, background: "#0b1118", border: "1px solid #1e2d3d",
                borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#cbd5e1",
                transition: "border-color 0.15s" }}>
              {t.title}
            </div>
          ))}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 2 }}>SERIES</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>{lockedTitle}</div>
            </div>
            <button onClick={handleUnlock}
              style={{ background: "none", border: "1px solid #1e2d3d", color: "#475569", padding: "4px 10px",
                cursor: "pointer", fontSize: 11, fontFamily: F, borderRadius: 5 }}>
              Change
            </button>
          </div>

          <input
            style={{ width: "100%", background: "#0b1118", border: "1px solid #1e2d3d", color: "#e2e8f0",
              padding: "9px 12px", fontSize: 13, marginBottom: 8, fontFamily: F, borderRadius: 6, outline: "none",
              boxSizing: "border-box" }}
            placeholder="Arc name (e.g. Chimera Ant Arc)"
            value={arcName}
            onChange={e => setArcName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          <button
            style={{ width: "100%", background: "#3b82f6", border: "none", color: "#fff", padding: "10px",
              cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: F, borderRadius: 6,
              opacity: arcName.trim() ? 1 : 0.4 }}
            onClick={handleSubmit}>
            Submit Arc
          </button>

          {submitted.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 6 }}>SUBMITTED</div>
              {submitted.map((name, i) => (
                <div key={i} style={{ fontSize: 12, color: "#34d399", padding: "3px 0",
                  borderBottom: "1px solid #0f1a2a", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#34d399" }}>✓</span> {name}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

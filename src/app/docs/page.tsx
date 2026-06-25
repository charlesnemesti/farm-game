import { DocsBackToFarmButton } from "@/components/docs/DocsBackToFarmButton";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import {
  getClusterLabel,
  getCornMintAddress,
  getTreasuryPublicKey,
} from "@/lib/treasuryConfig";
import { DOCS_NAV_GROUPS, DOCS_SECTIONS } from "@/lib/docsContent";

export const metadata = {
  title: "Docs — SolFarm",
  description: "Complete guide to SolFarm gameplay, $CORN, treasury, and on-chain features",
};

function DocsSectionBlock({
  id,
  title,
  paragraphs,
  bullets,
  subsections,
}: (typeof DOCS_SECTIONS)[number]) {
  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-xl border border-white/10 bg-black/50 p-6 sm:p-7"
    >
      <h2 className="border-b border-white/10 pb-3 text-xl font-bold text-farm-sun">
        {title}
      </h2>

      {paragraphs && paragraphs.length > 0 ? (
        <div className="mt-4 space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-white/75">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {subsections && subsections.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {subsections.map((sub) => (
            <div
              key={sub.title}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <h3 className="text-sm font-semibold text-white">{sub.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">{sub.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {bullets && bullets.length > 0 ? (
        <ul className="mt-5 list-none space-y-2 text-sm leading-relaxed text-white/75">
          {bullets.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-farm-sun/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function OnChainSection({
  treasury,
  mint,
}: {
  treasury: string | null;
  mint: string | null;
}) {
  return (
    <section
      id="on-chain"
      className="scroll-mt-32 rounded-xl border border-white/10 bg-black/50 p-6 sm:p-7"
    >
      <h2 className="border-b border-white/10 pb-3 text-xl font-bold text-farm-sun">
        On-chain addresses
      </h2>
      <p className="mt-4 text-sm text-white/70">
        Always verify these addresses on Solscan before depositing or withdrawing.
      </p>
      <dl className="mt-5 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Treasury wallet
          </dt>
          <dd className="mt-2 break-all font-mono text-xs leading-relaxed text-farm-sun sm:text-sm">
            {treasury ?? "Configure NEXT_PUBLIC_TREASURY_PUBKEY"}
          </dd>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/50">
            $CORN mint (pump.fun)
          </dt>
          <dd className="mt-2 break-all font-mono text-xs leading-relaxed text-farm-sun sm:text-sm">
            {mint ?? "Configure NEXT_PUBLIC_CORN_MINT"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default function DocsPage() {
  const treasury = getTreasuryPublicKey();
  const mint = getCornMintAddress();

  return (
    <div className="min-h-screen bg-[#0d1117] pt-28 text-white sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 sm:top-32">
              <DocsSidebar />
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6">
              <DocsBackToFarmButton />
            </div>

            <header className="mb-10 border-b border-white/10 pb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-farm-sun/80">
                Documentation
              </p>
              <h1 className="mt-2 text-3xl font-bold text-farm-sun sm:text-4xl">
                SolFarm Docs
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
                Everything you need to understand the game, the economy, and on-chain
                features on {getClusterLabel()}.
              </p>
            </header>

            <nav
              aria-label="Documentation sections (mobile)"
              className="mb-8 rounded-xl border border-white/10 bg-black/50 p-4 lg:hidden"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Jump to section
              </p>
              <div className="mt-3 space-y-4">
                {DOCS_NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-farm-sun/70">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75 transition hover:border-farm-sun/40 hover:text-farm-sun"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="space-y-8">
              {DOCS_SECTIONS.map((section) => (
                <DocsSectionBlock key={section.id} {...section} />
              ))}
              <OnChainSection
                treasury={treasury?.toBase58() ?? null}
                mint={mint ?? null}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

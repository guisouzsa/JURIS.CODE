"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function CheckBadge({ highlight = false }: { highlight?: boolean }) {
  return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-background' : 'bg-surface-container-high'}`}>
      <span className={`material-symbols-outlined text-[12px] ${highlight ? 'text-primary' : 'text-accent-gray'}`}>check</span>
    </div>
  );
}

export default function Page() {
  const [lightboxMedia, setLightboxMedia] = useState<{src: string, type: 'image' | 'video'} | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  const iaSlides = [
    { src: "/IA-Tela1.jpg", duration: 3000 },
    { src: "/IA-Tela2.jpg", duration: 3000 },
    { src: "/IA-Tela3.jpg", duration: 2500 },
    { src: "/IA-Tela4.jpg", duration: 4000 },
    { src: "/IA-Tela5.jpg", duration: 3500 },
    { src: "/IA-Tela6.jpg", duration: 4000 },
    { src: "/IA-Tela7.jpg", duration: 3000 },
  ];

  // Slideshow da demonstração de IA: crossfade + 8px, avanço automático, loop
  useEffect(() => {
    const duration = iaSlides[slideIndex].duration;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      setSlideProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const timeout = setTimeout(() => {
      setSlideIndex((prev) => (prev + 1) % iaSlides.length);
    }, duration);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex]);

  // Generic Reveal Observer (with tilt added in CSS)
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal-up');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  const faqs = [
    { q: "O que exatamente a IA faz por mim?", a: "A IA ajuda a organizar sua rotina, identificar prioridades, analisar tarefas, compromissos e prazos e sugerir uma forma mais eficiente de distribuir seu trabalho. Ela reduz o tempo gasto procurando e organizando informações para que você possa se concentrar no que exige sua experiência." },
    { q: "A IA substitui o meu trabalho como advogado?", a: "Não. A IA foi projetada para auxiliar na organização e na execução da rotina, não para exercer a profissão. Ela não toma decisões jurídicas, não substitui seu julgamento e não assume o controle do seu trabalho. A decisão continua sendo sua." },
    { q: "O que são os agentes?", a: "Os agentes são recursos de assistência que podem executar tarefas específicas dentro da plataforma, de acordo com as informações e permissões disponíveis. Eles existem para reduzir atividades repetitivas e ajudar você a trabalhar com mais rapidez e consistência." },
    { q: "Meus dados e os dos meus clientes estão seguros?", a: "O JURIS.CODE foi pensado para lidar com informações profissionais com controle de acesso, permissões e boas práticas de segurança. O acesso às informações deve ser controlado de acordo com o perfil de cada usuário e com as necessidades do escritório." },
    { q: "O JURIS.CODE substitui o PJe, e-SAJ ou outros sistemas oficiais?", a: "Não. O JURIS.CODE funciona como uma camada de organização e gestão da rotina. Ele não substitui os sistemas oficiais dos tribunais nem altera a responsabilidade do profissional de acompanhar e realizar os procedimentos necessários nesses ambientes." },
    { q: "Posso cancelar meu plano quando quiser?", a: "Sim. O plano pode ser cancelado quando você decidir. O cancelamento interrompe a renovação das próximas cobranças de acordo com as condições do plano contratado." },
    { q: "Preciso de treinamento para usar a plataforma?", a: "Não é necessário um treinamento complexo. A plataforma foi pensada para ser intuitiva e permitir que você comece rapidamente. Recursos de orientação podem ajudar nos primeiros passos e na configuração da rotina do escritório." },
    { q: "Qual a diferença entre os planos Essencial, Profissional e Inteligente?", a: "O Essencial reúne os recursos fundamentais para organizar agenda, clientes, processos, tarefas e notas. O Profissional adiciona recursos como documentos, automações e relatórios. O Inteligente reúne esses recursos e adiciona funcionalidades avançadas de IA, como planejamento automático, prioridades inteligentes e triagem da rotina." }
  ];

  return (
    <>
      {/* Lightbox Overlay */}
      {lightboxMedia && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 sm:p-8 cursor-zoom-out transition-all duration-300"
          onClick={() => setLightboxMedia(null)}
        >
          <div className="relative max-w-7xl w-full h-[90vh] flex flex-col items-center justify-center gap-4">
            {lightboxMedia.type === 'video' ? (
              <video 
                src={lightboxMedia.src} 
                controls 
                autoPlay 
                loop 
                className="max-w-full max-h-full rounded-xl border border-surface-container-high ambient-glow shadow-2xl cursor-default aspect-[16/10] object-cover" 
                onClick={(e) => e.stopPropagation()} 
              />
            ) : (
              <img 
                src={lightboxMedia.src} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl border border-surface-container-high ambient-glow shadow-2xl cursor-default" 
                onClick={(e) => e.stopPropagation()} 
                alt="Zoomed interface"
              />
            )}
            <button 
              className="absolute -top-12 right-0 text-on-surface-variant flex items-center gap-2 hover:text-primary transition-colors font-label-caps tracking-widest text-sm" 
              onClick={() => setLightboxMedia(null)}
            >
              <span className="material-symbols-outlined">close</span> FECHAR
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 ease-in-out bg-background/90 backdrop-blur-md border-b border-surface-container-high">
        <div className="flex justify-between items-center max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-6">
          <div className="flex items-center gap-12">
            <a className="font-headline-md text-headline-md tracking-widest text-primary" href="#">JURIS.CODE</a>
            <div className="hidden md:flex gap-8">
              <a className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300" href="#produto">PRODUTO</a>
              <a className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300" href="#recursos">RECURSOS</a>
              <a className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300" href="#ia">IA</a>
              <a className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300" href="#planos">PLANOS</a>
              <a className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300" href="#faq">FAQ</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="font-label-nav text-label-nav text-on-surface-variant hover:text-primary transition-colors duration-300">
              ENTRAR
            </Link>
            <Link href="/register" className="bg-primary text-background font-label-caps text-label-caps px-8 py-4 hover:bg-secondary transition-colors rounded-sm">
              COMEÇAR AGORA
            </Link>
          </div>
          <button className="md:hidden text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </nav>

      {/* Side Navigation (Scroll Indicator) */}
      <div className="hidden xl:flex fixed right-margin-desktop top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-40">
        <span className="font-label-caps text-label-caps text-on-surface-variant rotate-90 origin-center tracking-widest whitespace-nowrap mb-12">SCROLL</span>
        <div className="w-[1px] h-24 bg-surface-container-high relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-primary opacity-50 animate-[scrolldown_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      <main className="flex-grow pt-32">
        {/* Section 1: Hero */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center relative px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto text-center mb-stack-xl pt-16">
          <div className="absolute inset-0 -z-10 pointer-events-none hero-glow"></div>

          <div className="max-w-4xl mx-auto w-full space-y-8 reveal-up mt-8 relative z-10 py-16">
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none flex items-center justify-center" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }}>
              <svg width="100%" height="150%" viewBox="0 0 1440 800" preserveAspectRatio="none" className="w-full h-full opacity-80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <path className="string-line" d="M -100 400 Q 360 150 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" style={{ animationDelay: '0s', animationDuration: '8s' }} />
                <path className="string-line" d="M -100 400 Q 360 650 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" style={{ animationDelay: '-2s', animationDuration: '11s' }} />
                <path className="string-line" d="M -100 400 Q 360 250 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" style={{ animationDelay: '-4s', animationDuration: '6s' }} />
                <path className="string-line" d="M -100 400 Q 360 550 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" style={{ animationDelay: '-6s', animationDuration: '14s' }} />
              </svg>
            </div>

            <h1 className="font-square text-headline-lg-mobile md:text-headline-lg text-primary leading-tight font-bold tracking-tight">
              Sua rotina jurídica,<br/>sob controle.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
              Organize clientes, processos, prazos, tarefas e compromissos em um único lugar — sem depender da memória ou de planilhas soltas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/register" className="w-full sm:w-auto bg-primary text-background font-label-caps text-label-caps px-10 py-5 hover:bg-secondary transition-colors rounded-sm text-center">
                COMEÇAR AGORA
              </Link>
              <a href="#produto" className="w-full sm:w-auto border border-surface-container-high text-primary font-label-caps text-label-caps px-10 py-5 hover:bg-surface-container transition-colors tracking-widest rounded-sm text-center">
                CONHECER O JURIS.CODE
              </a>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto mt-24 relative reveal-up" style={{ transitionDelay: '200ms' }}>
            <div 
              className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-surface-container-high glow-pulse floating-image bg-surface-container-lowest cursor-zoom-in group"
              style={{ animationDelay: '0s' }}
              onClick={() => setLightboxMedia({ src: '/TelaAdm.jpg', type: 'image' })}
            >
              <img 
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" 
                src="/Dashboard.jpg" 
                alt="Dashboard Mockup"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
            </div>
            <p className="text-center mt-6 font-body-md text-on-surface-variant">
              <strong className="text-primary font-medium">Dashboard</strong> — sua rotina em uma única tela, com prazos, tarefas e prioridades do dia.
            </p>
          </div>
        </section>

        {/* Section 2: Problem */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up">
          <div className="text-center mb-stack-md">
            <h2 className="font-headline-md text-headline-md text-on-surface-variant max-w-3xl mx-auto font-normal">
              "O seu trabalho não deveria depender da sua memória."
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Card 1 */}
            <div className="border border-surface-container-high p-10 bg-surface-container-low/50 hover:bg-surface-container transition-colors duration-300 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-outline mb-8 block">calendar_today</span>
              <h3 className="font-label-caps text-label-caps text-primary mb-4">PRAZOS ESPALHADOS</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">A ansiedade de perder datas importantes por depender de anotações fragmentadas em múltiplos sistemas.</p>
            </div>
            {/* Card 2 */}
            <div className="border border-surface-container-high p-10 bg-surface-container-low/50 hover:bg-surface-container transition-colors duration-300 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-outline mb-8 block">event_busy</span>
              <h3 className="font-label-caps text-label-caps text-primary mb-4">AGENDA DESORGANIZADA</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Conflitos de horários e falta de visibilidade clara sobre os compromissos diários e semanais.</p>
            </div>
            {/* Card 3 */}
            <div className="border border-surface-container-high p-10 bg-surface-container-low/50 hover:bg-surface-container transition-colors duration-300 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-outline mb-8 block">layers_clear</span>
              <h3 className="font-label-caps text-label-caps text-primary mb-4">TAREFAS ACUMULADAS</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">A sobrecarga mental de gerenciar pendências operacionais em vez de focar na estratégia jurídica.</p>
            </div>
          </div>
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-body-lg text-body-lg text-primary">
              O JURIS.CODE tira essa complexidade do seu caminho — para que sua atenção volte para o que só você pode decidir.
            </p>
          </div>
        </section>

        {/* Section 3: Demonstração (Stacked Layout) */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up" id="produto">
          <div className="text-center mb-16">
            <h2 className="font-square text-headline-lg text-primary mb-6 font-bold tracking-tight">Tudo o que você precisa.<br/>Em um só lugar.</h2>
          </div>
          
          <div className="space-y-32">
            {/* Sub-demo 1: Visão Geral */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal-up">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Visão Geral</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">Controle total sobre sua prática. Dashboard centralizado com os dados mais importantes para o seu dia a dia.</p>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li className="flex items-center gap-3"><CheckBadge /> Processos ativos e encerrados</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Prazos e prioridades do dia</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Métricas de desempenho</li>
                </ul>
              </div>
              <div>
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-surface-container-high glow-pulse floating-image bg-surface-container-lowest cursor-zoom-in group" style={{ animationDelay: '0s' }} onClick={() => setLightboxMedia({ src: '/TelaAdm.jpg', type: 'image' })}>
                  <img src="/TelaAdm.jpg" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" alt="Painel de controle" />
                </div>
                <p className="text-center mt-4 font-body-md text-on-surface-variant text-sm">
                  <strong className="text-primary font-medium">Painel de controle</strong> — processos ativos, prazos e métricas de desempenho em tempo real.
                </p>
              </div>
            </div>

            {/* Sub-demo 2: Agenda Unificada */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal-up md:flex-row-reverse">
              <div className="md:order-2">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Agenda Unificada</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">Sincronize seus compromissos, prazos processuais e tarefas em uma única visualização inteligente.</p>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li className="flex items-center gap-3"><CheckBadge /> Visão semanal e mensal</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Alertas automáticos</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Resolução de conflitos</li>
                </ul>
              </div>
              <div className="md:order-1">
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-surface-container-high glow-pulse floating-image bg-surface-container-lowest cursor-zoom-in group" style={{ animationDelay: '-2s' }} onClick={() => setLightboxMedia({ src: '/Agenda.jpg', type: 'image' })}>
                  <img src="/Agenda.jpg" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" alt="Agenda inteligente" />
                </div>
                <p className="text-center mt-4 font-body-md text-on-surface-variant text-sm">
                  <strong className="text-primary font-medium">Agenda inteligente</strong> — compromissos, prazos processuais e tarefas sincronizados em um só calendário.
                </p>
              </div>
            </div>

            {/* Sub-demo 3: Gestão de Casos */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal-up">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Gestão de Casos</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">Acompanhe o andamento de cada processo, organize documentos e mantenha o histórico de clientes impecável.</p>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li className="flex items-center gap-3"><CheckBadge /> Linha do tempo processual</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Repositório de documentos</li>
                  <li className="flex items-center gap-3"><CheckBadge /> Ficha completa do cliente</li>
                </ul>
              </div>
              <div>
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-surface-container-high glow-pulse floating-image bg-surface-container-lowest cursor-zoom-in group" style={{ animationDelay: '-4s' }} onClick={() => setLightboxMedia({ src: '/GestaoCasos.jpg', type: 'image' })}>
                  <img src="/GestaoCasos.jpg" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" alt="Linha do tempo do processo" />
                </div>
                <p className="text-center mt-4 font-body-md text-on-surface-variant text-sm">
                  <strong className="text-primary font-medium">Linha do tempo do processo</strong> — histórico completo do caso, documentos e andamento em um só lugar.
                </p>
              </div>
            </div>
          </div>

          {/* CTA discreta pós-apresentação do produto */}
          <div className="mt-32 pt-16 border-t border-surface-container-high text-center">
            <h3 className="font-headline-md text-headline-md text-primary mb-3">Tudo organizado em um só lugar.</h3>
            <p className="font-body-md text-on-surface-variant mb-8">Conheça uma forma mais simples de acompanhar sua rotina jurídica.</p>
            <Link href="/register" className="inline-block border border-surface-container-high text-primary font-label-caps text-label-caps px-8 py-4 hover:bg-surface-container transition-colors rounded-sm">
              COMEÇAR AGORA
            </Link>
          </div>
        </section>

        {/* Section 4: Valores / Diferencial (Manifesto) */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up" id="recursos">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="font-headline-md text-headline-md text-primary mb-6">O diferencial está no foco.</h2>
            <p className="font-headline-md text-headline-md text-on-surface-variant font-normal leading-snug">
              O JURIS.CODE não foi criado para servir a qualquer negócio. Foi criado para entender a rotina jurídica.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-16 gap-y-12 mb-24">
            <div>
              <h4 className="font-label-caps text-label-caps text-outline tracking-widest mb-4">TECNOLOGIA ADAPTADA AO JURÍDICO</h4>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">Enquanto plataformas genéricas tentam atender diferentes profissões e necessidades, o JURIS.CODE parte de outro princípio: a tecnologia deve se adaptar ao trabalho jurídico, e não o contrário.</p>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-outline tracking-widest mb-4">FEITO PARA EVOLUIR</h4>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-4">Clientes, processos, prazos, audiências, documentos e tarefas possuem uma dinâmica própria. Por isso, cada parte da plataforma é pensada para tornar essa rotina mais organizada, previsível e simples de acompanhar.</p>
             
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center border-t border-surface-container-high pt-16">
            <p className="font-square text-headline-lg text-on-surface-variant leading-tight mb-2 font-bold tracking-tight">
              Não somos uma plataforma que também atende advogados.
            </p>
            <p className="font-square text-headline-lg text-primary leading-tight mb-10 font-bold tracking-tight">
              Somos uma plataforma construída para eles.
            </p>
            <p className="font-label-caps text-label-caps text-outline tracking-widest">
              Foco jurídico · Evolução contínua · Organização inteligente
            </p>
          </div>
        </section>

        {/* Section 5: IA — Demonstração em slideshow */}
        <section className="bg-surface-container-lowest py-stack-lg border-y border-surface-container-high mb-stack-xl reveal-up" id="ia">
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">A IA organiza. Você decide.</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Uma assistência inteligente para organizar sua rotina, identificar prioridades e reduzir a complexidade do trabalho diário.
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="font-label-caps text-label-caps text-primary tracking-widest mb-1">VEJA A INTELIGÊNCIA EM AÇÃO.</p>
              <p className="font-body-md text-on-surface-variant text-sm">Aguarde as primeiras 4 telas e acompanhe como o JURIS.CODE organiza sua rotina.</p>
            </div>

            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-surface-container-high bg-background relative ambient-glow aspect-[16/10]">
              {iaSlides.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={`Demonstração JURIS.CODE — tela ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] ease-out"
                  style={{
                    opacity: i === slideIndex ? 1 : 0,
                    transform: i === slideIndex ? 'translateY(0)' : 'translateY(8px)',
                    transitionDuration: '500ms',
                  }}
                />
              ))}
            </div>

            {/* Indicador editorial: contador + linha de progresso */}
            <div className="max-w-4xl mx-auto mt-5 flex items-center gap-4">
              <span className="font-body-md text-outline text-xs tabular-nums shrink-0">
                {String(slideIndex + 1).padStart(2, '0')} / {String(iaSlides.length).padStart(2, '0')}
              </span>
              <div className="flex-1 h-px bg-surface-container-high relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-outline"
                  style={{ width: `${slideProgress * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center mt-12 max-w-2xl mx-auto">
              <p className="font-headline-md text-primary">
                A tecnologia potencializa seu trabalho. A decisão continua sendo sua.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5.5: Manifesto IA */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up">
          <div className="max-w-3xl mx-auto divide-y divide-surface-container-high">
             <div className="flex items-start gap-6 py-10">
                <span className="material-symbols-outlined text-2xl text-accent-gray mt-1 shrink-0">account_tree</span>
                <div>
                  <h3 className="font-headline-md text-primary mb-3">Organiza, não decide</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">A IA ajuda a organizar prazos, agenda, tarefas e informações. As decisões jurídicas continuam sob seu controle.</p>
                </div>
             </div>
             <div className="flex items-start gap-6 py-10">
                <span className="material-symbols-outlined text-2xl text-accent-gray mt-1 shrink-0">gavel</span>
                <div>
                  <h3 className="font-headline-md text-primary mb-3">Ajuda, não substitui</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">O sistema reduz o trabalho operacional e prepara as informações para que você possa concentrar sua atenção no que exige conhecimento, experiência e julgamento profissional.</p>
                </div>
             </div>
             <div className="flex items-start gap-6 py-10">
                <span className="material-symbols-outlined text-2xl text-accent-gray mt-1 shrink-0">verified_user</span>
                <div>
                  <h3 className="font-headline-md text-primary mb-3">Trabalha para você, não no seu lugar</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">Você continua no controle do escritório, dos clientes e das decisões. A tecnologia apenas reduz a complexidade que existe ao redor do seu trabalho.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Section 6: Não apenas organize. Antecipe. (Redesenhado) */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="md:sticky md:top-32">
              <h2 className="font-headline-md text-headline-md text-primary mb-6">Não apenas organize. Antecipe.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                O JURIS.CODE transforma sua rotina em uma visão clara do que precisa da sua atenção antes que tudo se acumule.
              </p>
            </div>

            <div className="divide-y divide-surface-container-high/60">
              {[
                { n: "01", icon: "priority_high", title: "3 prazos importantes nesta semana", detail: "2 na terça-feira e 1 na sexta-feira." },
                { n: "02", icon: "task_alt", title: "5 tarefas continuam abertas", detail: "2 delas estão relacionadas a processos com prazo próximo." },
                { n: "03", icon: "mark_email_unread", title: "2 clientes aguardam retorno", detail: "Há mensagens pendentes desde sexta-feira." },
                { n: "04", icon: "schedule", title: "Uma janela de foco foi identificada", detail: "Quinta-feira à tarde está livre para avançar na elaboração da apelação Silva." },
              ].map((item) => (
                <div key={item.n} className="group flex items-start gap-5 py-7 px-4 -mx-4 rounded-md transition-all duration-[400ms] hover:bg-surface-container-lowest hover:translate-x-[3px]">
                  <span className="font-body-md text-outline group-hover:text-accent-gray transition-colors duration-[400ms] text-sm pt-0.5 tabular-nums">{item.n}</span>
                  <span className="material-symbols-outlined text-lg text-outline group-hover:text-accent-gray transition-colors duration-[400ms] mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-body-lg text-primary mb-1">{item.title}</p>
                    <p className="font-body-md text-on-surface-variant">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Segurança */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up" id="seguranca">
          <div className="text-center mb-12">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Seus dados merecem o mesmo cuidado que seu trabalho.</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <span className="px-4 py-2 border border-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-lowest">Controle de acesso</span>
            <span className="px-4 py-2 border border-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-lowest">Proteção de dados</span>
            <span className="px-4 py-2 border border-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-lowest">Backups</span>
            <span className="px-4 py-2 border border-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-lowest">Privacidade</span>
            <span className="px-4 py-2 border border-surface-container-high rounded-full font-label-caps text-label-caps text-on-surface-variant bg-surface-container-lowest">Infraestrutura segura</span>
          </div>
        </section>

        {/* Section 8: Planos */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up" id="planos">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary">Escolha o seu plano.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
            {/* Essencial */}
            <div className="border border-surface-container-high p-8 bg-surface-container-lowest text-center rounded-xl flex flex-col h-full">
              <div className="mb-8">
                <h3 className="font-headline-md text-primary mb-1">Essencial</h3>
                <p className="text-sm text-on-surface-variant mb-6">Para começar a organizar sua rotina</p>
                <p className="font-display-xl text-4xl text-primary">R$ 29<span className="text-lg text-on-surface-variant font-normal">/mês</span></p>
              </div>
              <ul className="space-y-4 font-body-md text-on-surface-variant mb-8 text-left flex-grow">
                <li className="flex items-center gap-3"><CheckBadge /> Gestão de tarefas</li>
                <li className="flex items-center gap-3"><CheckBadge /> Agenda simples</li>
                <li className="flex items-center gap-3"><CheckBadge /> Até 50 processos</li>
              </ul>
              <Link href="/register" className="block w-full text-center border border-surface-container-high text-primary font-label-caps py-4 hover:bg-surface-container transition-colors rounded-md mt-auto">COMEÇAR AGORA</Link>
            </div>
            {/* Inteligente (Highlighted) */}
            <div className="border border-accent-gray p-8 bg-background text-center relative gray-glow transform scale-105 z-10 rounded-xl flex flex-col h-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-gray text-background font-label-caps px-4 py-1.5 rounded-full text-[10px] tracking-widest font-bold shadow-lg">
                MAIS ESCOLHIDO
              </div>
              <div className="mb-8 mt-2">
                <h3 className="font-headline-md text-primary mb-1">Inteligente</h3>
                <p className="text-sm text-on-surface-variant mb-6">O poder completo da IA no seu dia a dia</p>
                <p className="font-display-xl text-4xl text-primary">R$ 99<span className="text-lg text-on-surface-variant font-normal">/mês</span></p>
              </div>
              <ul className="space-y-4 font-body-md text-primary mb-8 text-left flex-grow">
                <li className="flex items-center gap-3"><CheckBadge highlight /> Tudo do Profissional</li>
                <li className="flex items-center gap-3"><CheckBadge highlight /> <span className="font-bold">+</span> Assistente IA ilimitado</li>
                <li className="flex items-center gap-3"><CheckBadge highlight /> <span className="font-bold">+</span> Planejamento semanal IA</li>
                <li className="flex items-center gap-3"><CheckBadge highlight /> <span className="font-bold">+</span> Triagem automática</li>
              </ul>
              <Link href="/register" className="block w-full text-center bg-accent-gray text-background font-label-caps py-4 hover:bg-accent-gray-dim transition-colors rounded-md mt-auto">COMEÇAR AGORA</Link>
            </div>
            {/* Profissional */}
            <div className="border border-surface-container-high p-8 bg-surface-container-lowest text-center rounded-xl flex flex-col h-full">
              <div className="mb-8">
                <h3 className="font-headline-md text-primary mb-1">Profissional</h3>
                <p className="text-sm text-on-surface-variant mb-6">Controle total para advogados autônomos</p>
                <p className="font-display-xl text-4xl text-primary">R$ 59<span className="text-lg text-on-surface-variant font-normal">/mês</span></p>
              </div>
              <ul className="space-y-4 font-body-md text-on-surface-variant mb-8 text-left flex-grow">
                <li className="flex items-center gap-3"><CheckBadge /> Tudo do Essencial</li>
                <li className="flex items-center gap-3"><CheckBadge /> <span className="font-medium">+</span> Processos ilimitados</li>
                <li className="flex items-center gap-3"><CheckBadge /> <span className="font-medium">+</span> Gestão de documentos</li>
              </ul>
              <Link href="/register" className="block w-full text-center border border-surface-container-high text-primary font-label-caps py-4 hover:bg-surface-container transition-colors rounded-md mt-auto">COMEÇAR AGORA</Link>
            </div>
          </div>
        </section>

        {/* Section 9: FAQ (Redesenhado) */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto mb-stack-xl reveal-up" id="faq">
          <div className="mb-16">
            <h2 className="font-headline-md text-headline-md text-primary mb-3">Dúvidas Frequentes</h2>
            <p className="font-body-md text-on-surface-variant">Algumas respostas antes de você começar.</p>
          </div>
          <div className="divide-y divide-surface-container-high">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index}>
                  <button
                    className="w-full py-6 text-left flex items-center gap-6 group"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-body-md text-outline text-sm shrink-0 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                    <span className="font-body-lg text-primary flex-1 group-hover:text-accent-gray transition-colors duration-300">{faq.q}</span>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                      add
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pl-[2.75rem] pr-8 font-body-md text-on-surface-variant leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 10: CTA Final */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mb-stack-xl reveal-up text-center">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-6 max-w-4xl mx-auto leading-tight">
            Sua rotina jurídica pode ser mais simples.<br/>
            <span className="text-on-surface-variant">Organize o trabalho. Tenha clareza. Trabalhe melhor.</span>
          </h2>
          <Link href="/register" className="inline-block bg-primary text-background font-label-caps text-label-caps px-12 py-5 hover:bg-secondary transition-colors mt-8 rounded-sm">
            COMEÇAR AGORA
          </Link>
        </section>

        {/* Footer (Redesenhado) */}
        <footer className="border-t border-surface-container-high mt-stack-xl pt-16 pb-8 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <div className="font-headline-md text-headline-md text-primary tracking-widest mb-4">JURIS.CODE</div>
              <p className="font-body-md text-on-surface-variant">Sua rotina jurídica,<br/>sob controle.</p>
            </div>
            
            <div>
              <h4 className="font-label-caps text-primary tracking-widest mb-6">Produto</h4>
              <ul className="space-y-4 font-body-md text-on-surface-variant">
                <li><a href="#recursos" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#planos" className="hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#ia" className="hover:text-primary transition-colors">IA</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-label-caps text-primary tracking-widest mb-6">Empresa</h4>
              <ul className="space-y-4 font-body-md text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#seguranca" className="hover:text-primary transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-label-caps text-primary tracking-widest mb-6">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" title="LinkedIn">
                  In {/* Placeholder text for icon */}
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" title="Instagram">
                  Ig {/* Placeholder text for icon */}
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors" title="Twitter/X">
                  X {/* Placeholder text for icon */}
                </a>
              </div>
            </div>
          </div>
          
          <div className="max-w-[1440px] mx-auto border-t border-surface-container-high pt-8 flex justify-center">
            <div className="font-label-caps text-on-surface-variant text-[10px] tracking-widest text-center py-4">
              &copy; {new Date().getFullYear()} JURIS.CODE. TODOS OS DIREITOS RESERVADOS.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
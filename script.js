document.addEventListener('DOMContentLoaded', () => {
    const galeriaCards = document.getElementById('galeriaCards');
    const campoBusca = document.getElementById('campoBusca');
    const modalOverlay = document.getElementById('modalDetalhe');
    const modalFechar = document.getElementById('modalFechar');
    
    // Elementos do Modal
    const modalTitulo = document.getElementById('modalTitulo');
    const modalAno = document.getElementById('modalAno');
    const modalSinopse = document.getElementById('modalSinopse');
    const modalImagens = document.getElementById('modalImagens'); 
    const modalCitacoes = document.getElementById('modalCitacoes');

    let filmesData = [];
    const JSON_FILE_NAME = 'baseDeConhecimento.json'; 

    /**
     * Função removida: não precisamos mais de placeholders.
     */
    // function getPlaceholderImageUrl(id, index) { /* ... */ }

    /**
     * Carrega os dados do arquivo JSON
     */
    async function carregarFilmes() {
        try {
            const response = await fetch(JSON_FILE_NAME); 
            
            if (!response.ok) {
                 throw new Error(`Erro de rede ao carregar ${JSON_FILE_NAME}. Status: ${response.status}`);
            }

            filmesData = await response.json();
            
            if (Array.isArray(filmesData) && filmesData.length > 0) {
                 renderizarCards(filmesData);
            } else {
                galeriaCards.innerHTML = `<p style="color: #e74c3c; font-size: 1.2em;">O arquivo ${JSON_FILE_NAME} está vazio ou malformado.</p>`;
            }

        } catch (error) {
            console.error(`ERRO FATAL ao carregar o JSON:`, error);
            galeriaCards.innerHTML = `<p style="color: #e74c3c; font-size: 1.2em;">Falha ao carregar os dados. Verifique o console para mais detalhes.</p>`;
        }
    }

    /**
     * Renderiza os cards de filmes na galeria
     */
    function renderizarCards(filmes) {
        galeriaCards.innerHTML = ''; 
        
        if (filmes.length === 0) {
            galeriaCards.innerHTML = '<p style="color: #777; font-size: 1.2em; grid-column: 1 / -1; text-align: center;">Nenhum filme encontrado. Tente outra palavra-chave.</p>';
            return;
        }

        filmes.forEach(filme => {
            const titulo = filme.nome_ghibli || 'Filme Desconhecido'; 
            const ano = filme.ano_lancamento || 'N/A';
            const corDestaque = filme.cor_principal || '#999999'; 
            
            const idSlug = titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const card = document.createElement('div');
            card.className = 'card-filme';
            card.dataset.id = idSlug; 

            // **NOVO: USA A PRIMEIRA URL DO JSON (índice 0) PARA O CARD**
            const backgroundUrl = (filme.imagens_urls && filme.imagens_urls.length > 0) 
                                 ? filme.imagens_urls[0] 
                                 : 'https://via.placeholder.com/600x400?text=Sem+Imagem'; // Fallback
            
            card.innerHTML = `
                <div class="card-background" style="background-image: url('${backgroundUrl}'); border-bottom: 5px solid ${corDestaque};"></div>
                <div class="card-overlay">
                    <h3>${titulo}</h3>
                    <small>${ano}</small>
                </div>
            `;
            
            card.addEventListener('click', () => abrirModal(filme));
            galeriaCards.appendChild(card);
        });
    }

    /**
     * Abre o modal com os detalhes do filme
     */
    function abrirModal(filme) {
        const corDestaque = filme.cor_principal || '#2ecc71'; 
        
        // Dados do JSON
        const titulo = filme.nome_ghibli || 'Título Indisponível';
        const ano = filme.ano_lancamento || 'N/A';
        const sinopse = filme.sinopse || 'Nenhuma descrição disponível.'; 
        const diretor = filme.diretor || 'Diretor Desconhecido';
        
        // Aplica a cor de destaque como variável CSS
        document.documentElement.style.setProperty('--cor-destaque', corDestaque);


        // --- SEÇÃO DE TEXTO ---
        modalTitulo.textContent = titulo;
        modalTitulo.style.color = corDestaque; 
        modalAno.textContent = `Ano: ${ano} | Diretor: ${diretor}`;
        modalSinopse.textContent = sinopse;


        // --- SEÇÃO DE IMAGENS (AGORA USA AS URLs DO JSON) ---
        modalImagens.innerHTML = '';
        
        const urls = filme.imagens_urls;
        
        if (urls && Array.isArray(urls) && urls.length >= 1) {
            
            // 1. IMAGEM 1 (RETRATO) - É o primeiro filho direto
            const img1 = document.createElement('img');
            img1.src = urls[0];
            img1.alt = `Cena 1 de ${titulo} (Retrato)`;
            img1.style.border = `2px solid ${corDestaque}`;
            modalImagens.appendChild(img1);

            // 2. COLUNA DIREITA (Para Imagens 2 e 3, Horizontais)
            const colunaDireita = document.createElement('div');
            colunaDireita.className = 'modal-imagens-coluna-direita';

            // Adiciona as imagens 2 e subsequentes (se existirem)
            for (let i = 1; i < urls.length; i++) {
                const img = document.createElement('img');
                img.src = urls[i];
                img.alt = `Cena ${i + 1} de ${titulo} (Paisagem)`;
                img.style.border = `2px solid ${corDestaque}`;
                colunaDireita.appendChild(img);
            }
            
            // Adiciona a coluna da direita ao container principal
            modalImagens.appendChild(colunaDireita);
            
        } else {
             modalImagens.innerHTML = `<p style="text-align: center; color: #777;">Imagens indisponíveis.</p>`;
        }


        // --- SEÇÃO DE CITAÇÕES E TEMAS ---
        modalCitacoes.innerHTML = ''; // Limpa completamente a seção para evitar repetição

        // 1. Título principal da seção de detalhes
        const h3 = document.createElement('h3');
        h3.textContent = 'Citações e Temas';
        modalCitacoes.appendChild(h3);
        
        // 2. Adiciona as citações geradas pelo modelo
        if (filme.citacoes && Array.isArray(filme.citacoes) && filme.citacoes.length > 0) {
            filme.citacoes.forEach((citacao) => {
                const li = document.createElement('li');
                li.textContent = `"${citacao}"`;
                // A cor da borda esquerda é definida no CSS usando --cor-destaque
                modalCitacoes.appendChild(li);
            });
        }

        // 3. Adiciona Tags Temáticas (no final da lista de citações/temas)
        if (filme.tags_tematicas && Array.isArray(filme.tags_tematicas) && filme.tags_tematicas.length > 0) {
            const tagsText = filme.tags_tematicas.map((tag) => `#${tag.toLowerCase()}`).join(' ');
            const tagLi = document.createElement('li');
            tagLi.textContent = tagsText;
            tagLi.style.fontWeight = 'bold';
            tagLi.style.marginTop = '15px';
            modalCitacoes.appendChild(tagLi);
        } else if (!filme.citacoes || filme.citacoes.length === 0) {
             // Apenas mostra esta mensagem se não houver NADA (nem citações nem tags)
             const li = document.createElement('li');
             li.textContent = 'Nenhuma citação ou tema encontrado.';
             modalCitacoes.appendChild(li);
        }
        
        // Exibe o Modal
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    // --- FUNÇÕES AUXILIARES ---
    function fecharModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.documentElement.style.removeProperty('--cor-destaque'); // Limpa a cor
    }

    // Eventos de Fechamento do Modal
    modalFechar.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            fecharModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            fecharModal();
        }
    });

    campoBusca.addEventListener('input', (e) => {
        const target = e.target;
        const termoBusca = (target instanceof HTMLInputElement ? target.value : '').toLowerCase().trim();
        const filmesFiltrados = filmesData.filter(filme => 
            (filme.nome_ghibli && filme.nome_ghibli.toLowerCase().includes(termoBusca)) ||
            (filme.sinopse && filme.sinopse.toLowerCase().includes(termoBusca)) ||
            (filme.tags_tematicas && filme.tags_tematicas.some(keyword => keyword.toLowerCase().includes(termoBusca)))
        );
        renderizarCards(filmesFiltrados);
    });
    
    // Inicia o carregamento dos dados
    carregarFilmes();
});
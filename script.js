/************************************************
 CONFIGURAÇÕES SUPABASE
************************************************/

const SUPABASE_URL =
    "https://gmizhmkichnkzsdaznjg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_4j1VkO20dQG7R6oMYRMwgA_V9HYVRri";

const BUCKET =
    "fotos-casamento";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/************************************************
 CONFIGURAÇÕES
************************************************/

const SENHA_ADMIN =
    "CASAMENTO2026";


/************************************************
 VARIÁVEIS
************************************************/

let fotoSelecionada = null;

let modoGaleria =
    "pendentes";

let fotosApresentacao = [];

let intervaloApresentacao = null;

let intervaloAtualizacaoApresentacao = null;


/************************************************
 ABRIR ENVIO
************************************************/

function abrirEnvio() {

    esconderTodasTelas();

    document
        .getElementById(
            "envioTela"
        )
        .classList
        .remove(
            "escondido"
        );

}


/************************************************
 PREVIEW DA FOTO
************************************************/

document
    .getElementById(
        "fotoInput"
    )
    .addEventListener(
        "change",
        function(event) {

            const arquivo =
                event.target.files[0];

            if (!arquivo) {

                return;

            }

            fotoSelecionada =
                arquivo;

            const imagem =
                document
                .getElementById(
                    "previewImagem"
                );

            imagem.src =
                URL.createObjectURL(
                    arquivo
                );

            document
                .getElementById(
                    "previewContainer"
                )
                .classList
                .remove(
                    "escondido"
                );

        }
    );


/************************************************
 COMPRIMIR FOTO
************************************************/

function comprimirImagem(
    arquivo,
    qualidade = 0.85,
    larguraMaxima = 2400
) {

    return new Promise(
        function(resolve,reject) {

            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {

                reject(
                    new Error(
                        "O arquivo não é uma imagem."
                    )
                );

                return;

            }

            const leitor =
                new FileReader();

            leitor.onload =
                function(event) {

                    const imagem =
                        new Image();

                    imagem.onload =
                        function() {

                            let largura =
                                imagem.width;

                            let altura =
                                imagem.height;

                            if (
                                largura >
                                larguraMaxima
                            ) {

                                const proporcao =
                                    larguraMaxima /
                                    largura;

                                largura =
                                    larguraMaxima;

                                altura =
                                    Math.round(
                                        altura *
                                        proporcao
                                    );

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                largura;

                            canvas.height =
                                altura;

                            const contexto =
                                canvas.getContext(
                                    "2d"
                                );

                            contexto.drawImage(
                                imagem,
                                0,
                                0,
                                largura,
                                altura
                            );

                            canvas.toBlob(
                                function(blob) {

                                    if (!blob) {

                                        reject(
                                            new Error(
                                                "Não foi possível processar a imagem."
                                            )
                                        );

                                        return;

                                    }

                                    resolve(
                                        blob
                                    );

                                },

                                "image/jpeg",

                                qualidade
                            );

                        };

                    imagem.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Não foi possível carregar a imagem."
                                )
                            );

                        };

                    imagem.src =
                        event.target.result;

                };

            leitor.onerror =
                function() {

                    reject(
                        new Error(
                            "Erro ao ler o arquivo."
                        )
                    );

                };

            leitor.readAsDataURL(
                arquivo
            );

        }
    );

}


/************************************************
 ENVIAR FOTO
************************************************/

async function enviarFoto() {

    const status =
        document.getElementById(
            "statusEnvio"
        );

    if (!fotoSelecionada) {

        status.innerText =
            "📸 Escolha ou tire uma foto primeiro.";

        return;

    }

    try {

        status.innerText =
            "⏳ Preparando sua foto...";

        let qualidade =
            0.88;

        let imagemComprimida =
            await comprimirImagem(
                fotoSelecionada,
                qualidade
            );

        while (
            imagemComprimida.size >
            2 * 1024 * 1024 &&
            qualidade > 0.50
        ) {

            qualidade =
                qualidade - 0.05;

            imagemComprimida =
                await comprimirImagem(
                    fotoSelecionada,
                    qualidade
                );

        }

        status.innerText =
            "⏳ Enviando foto...";

        const nomeArquivo =

            "aguardando/" +

            Date.now() +

            "_" +

            Math.random()
            .toString(36)
            .substring(2,8) +

            ".jpg";

        const {

            error

        } =

        await supabaseClient
            .storage
            .from(BUCKET)
            .upload(

                nomeArquivo,

                imagemComprimida,

                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        "image/jpeg"

                }

            );

        if (error) {

            console.error(
                error
            );

            status.innerText =
                "❌ Erro ao enviar a foto: " +
                error.message;

            return;

        }

        status.innerText =
            "✅ Foto enviada com sucesso! Obrigado por compartilhar esse momento ❤️";

        fotoSelecionada =
            null;

        document
            .getElementById(
                "fotoInput"
            )
            .value = "";

        document
            .getElementById(
                "previewContainer"
            )
            .classList
            .add(
                "escondido"
            );

    }

    catch (error) {

        console.error(
            error
        );

        status.innerText =
            "❌ Erro ao preparar a foto: " +
            error.message;

    }

}


/************************************************
 ABRIR SENHA
************************************************/

function abrirSenha() {

    const autorizado =
        localStorage.getItem(
            "adminAutorizado"
        );

    if (
        autorizado === "sim"
    ) {

        modoGaleria =
            "pendentes";

        esconderTodasTelas();

        document
            .getElementById(
                "validacaoTela"
            )
            .classList
            .remove(
                "escondido"
            );

        document.querySelector(
            "#validacaoTela h2"
        ).innerText =
            "📋 Fotos Aguardando Liberação";

        document
            .getElementById(
                "botaoSairTopo"
            )
            .classList
            .add(
                "escondido"
            );

        carregarFotosPendentes();

        return;

    }

    esconderTodasTelas();

    document
        .getElementById(
            "senhaTela"
        )
        .classList
        .remove(
            "escondido"
        );

}


/************************************************
 VALIDAR SENHA
************************************************/

function validarSenha() {

    const senha =

        document
        .getElementById(
            "senha"
        )
        .value;

    const erro =

        document
        .getElementById(
            "erroSenha"
        );

    if (
        senha === SENHA_ADMIN
    ) {

        localStorage.setItem(
            "adminAutorizado",
            "sim"
        );

        modoGaleria =
            "pendentes";

        esconderTodasTelas();

        document
            .getElementById(
                "validacaoTela"
            )
            .classList
            .remove(
                "escondido"
            );

        document.querySelector(
            "#validacaoTela h2"
        ).innerText =
            "📋 Fotos Aguardando Liberação";

        document
            .getElementById(
                "botaoSairTopo"
            )
            .classList
            .add(
                "escondido"
            );

        erro.innerText = "";

        carregarFotosPendentes();

    }

    else {

        erro.innerText =
            "❌ Senha incorreta!";

    }

}


/************************************************
 ATUALIZAR FOTOS
************************************************/

function atualizarFotos() {

    if (
        modoGaleria ===
        "aprovadas"
    ) {

        visualizarFotos();

    }

    else {

        carregarFotosPendentes();

    }

}


/************************************************
 CARREGAR FOTOS PENDENTES
************************************************/

async function carregarFotosPendentes() {

    modoGaleria =
        "pendentes";

    document
        .getElementById(
            "botaoSairTopo"
        )
        .classList
        .add(
            "escondido"
        );

    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );

    const mensagem =

        document
        .getElementById(
            "nenhumaFoto"
        );

    galeria.innerHTML = "";

    mensagem.innerText =
        "⏳ Carregando fotos...";

    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aguardando",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );

    if (error) {

        console.error(
            error
        );

        mensagem.innerText =
            "❌ Erro ao carregar as fotos.";

        return;

    }

    if (
        !data ||
        data.length === 0
    ) {

        mensagem.innerText =
            "📭 Nenhuma foto aguardando aprovação.";

        return;

    }

    mensagem.innerText =

        "📸 " +

        data.length +

        " foto(s) aguardando aprovação";

    data.forEach(
        function(foto) {

            criarCardFoto(
                foto
            );

        }
    );

}


/************************************************
 CRIAR CARD DA FOTO
************************************************/

function criarCardFoto(foto) {

    const caminho =

        "aguardando/" +
        foto.name;

    const {

        data

    } =

    supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(
            caminho
        );

    const urlFoto =
        data.publicUrl;

    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "foto-card";

    card.innerHTML =

        `

        <img
            src="${urlFoto}"
            alt="Foto enviada"
        >

        <div class="nome-foto">

            ${foto.name}

        </div>

        <div class="botoes-foto">

            <button
                class="botao-aprovar"
                onclick="aprovarFoto('${foto.name}')"
            >

                ✅ Permitir

            </button>

            <button
                class="botao-reprovar"
                onclick="reprovarFoto('${foto.name}')"
            >

                ❌ Bloquear

            </button>

        </div>

        `;

    galeria.appendChild(
        card
    );

}


/************************************************
 APROVAR FOTO
************************************************/

async function aprovarFoto(nomeFoto) {

    const confirmar =

        confirm(
            "Deseja permitir esta foto?"
        );

    if (!confirmar) {

        return;

    }

    const {

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .move(

            "aguardando/" +
            nomeFoto,

            "aprovadas/" +
            nomeFoto

        );

    if (error) {

        console.error(
            error
        );

        alert(
            "❌ Erro ao aprovar a foto:\n\n" +
            error.message
        );

        return;

    }

    alert(
        "✅ Foto aprovada!"
    );

    carregarFotosPendentes();

}


/************************************************
 REPROVAR FOTO
************************************************/

async function reprovarFoto(nomeFoto) {

    const confirmar =

        confirm(
            "Deseja bloquear esta foto?"
        );

    if (!confirmar) {

        return;

    }

    const {

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .move(

            "aguardando/" +
            nomeFoto,

            "reprovadas/" +
            nomeFoto

        );

    if (error) {

        console.error(
            error
        );

        alert(
            "❌ Erro ao bloquear a foto:\n\n" +
            error.message
        );

        return;

    }

    alert(
        "🚫 Foto bloqueada!"
    );

    carregarFotosPendentes();

}


/************************************************
 VISUALIZAR FOTOS APROVADAS
************************************************/

async function visualizarFotos() {

    modoGaleria =
        "aprovadas";

    esconderTodasTelas();

    document
        .getElementById(
            "validacaoTela"
        )
        .classList
        .remove(
            "escondido"
        );

    document.querySelector(
        "#validacaoTela h2"
    ).innerText =
        "🖼️ Fotos Aprovadas";

    document
        .getElementById(
            "botaoSairTopo"
        )
        .classList
        .remove(
            "escondido"
        );

    const galeria =

        document
        .getElementById(
            "galeriaPendentes"
        );

    const mensagem =

        document
        .getElementById(
            "nenhumaFoto"
        );

    galeria.innerHTML = "";

    mensagem.innerText =
        "⏳ Carregando fotos aprovadas...";

    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aprovadas",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );

    if (error) {

        mensagem.innerText =
            "❌ Erro ao carregar fotos.";

        return;

    }

    if (
        !data ||
        data.length === 0
    ) {

        mensagem.innerText =
            "📭 Ainda não existem fotos aprovadas.";

        return;

    }

    mensagem.innerText =

        data.length +

        " foto(s) disponíveis ❤️";

    data.forEach(
        function(foto) {

            const caminho =

                "aprovadas/" +
                foto.name;

            const {

                data: urlData

            } =

            supabaseClient
                .storage
                .from(BUCKET)
                .getPublicUrl(
                    caminho
                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "foto-card";

            card.innerHTML =

                `

                <img
                    src="${urlData.publicUrl}"
                    alt="Foto"
                >

                `;

            galeria.appendChild(
                card
            );

        }
    );

}


/************************************************
 ABRIR APRESENTAÇÃO
************************************************/

async function abrirApresentacao() {

    esconderTodasTelas();

    document
        .getElementById(
            "apresentacaoTela"
        )
        .classList
        .remove(
            "escondido"
        );

    clearInterval(
        intervaloApresentacao
    );

    clearInterval(
        intervaloAtualizacaoApresentacao
    );

    await carregarFotosApresentacao();

    intervaloApresentacao =
        setInterval(

            trocarFotosApresentacao,

            10000

        );

    intervaloAtualizacaoApresentacao =
        setInterval(

            carregarFotosApresentacao,

            30000

        );

}


/************************************************
 CARREGAR FOTOS DA APRESENTAÇÃO
************************************************/

async function carregarFotosApresentacao() {

    const painel =

        document
        .getElementById(
            "painelApresentacao"
        );

    const status =

        document
        .getElementById(
            "statusApresentacao"
        );

    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .list(

            "aprovadas",

            {

                limit: 1000,

                sortBy: {

                    column:
                        "created_at",

                    order:
                        "desc"

                }

            }

        );

    if (error) {

        console.error(
            error
        );

        status.innerText =
            "❌ Erro ao carregar as fotos.";

        return;

    }

    if (
        !data ||
        data.length === 0
    ) {

        painel.innerHTML = "";

        status.innerText =
            "❤️ Aguardando as primeiras fotos aprovadas...";

        return;

    }

    fotosApresentacao =

        data.map(
            function(foto) {

                const caminho =

                    "aprovadas/" +
                    foto.name;

                const {

                    data: urlData

                } =

                supabaseClient
                    .storage
                    .from(BUCKET)
                    .getPublicUrl(
                        caminho
                    );

                return {

                    nome:
                        foto.name,

                    url:
                        urlData.publicUrl

                };

            }
        );

    status.innerText =

        "❤️ " +

        fotosApresentacao.length +

        " momentos compartilhados";

    trocarFotosApresentacao();

}


/************************************************
 ESCOLHER LAYOUT DA APRESENTAÇÃO

 IMPORTANTE:

 LAYOUT 1:
 FOTO GRANDE À ESQUERDA
 + 4 FOTOS PEQUENAS À DIREITA

 LAYOUT 4:
 4 FOTOS PEQUENAS À ESQUERDA
 + FOTO GRANDE À DIREITA
************************************************/

function escolherLayout() {

    const layouts = [

        "painel-layout-1",

        "painel-layout-4"

    ];

    const indice =

        Math.floor(

            Math.random() *
            layouts.length

        );

    return layouts[indice];

}


/************************************************
 IDENTIFICAR PROPORÇÃO DA FOTO
************************************************/

function carregarProporcaoImagem(
    url
) {

    return new Promise(
        function(resolve) {

            const imagem =
                new Image();

            imagem.onload =
                function() {

                    resolve({

                        largura:
                            imagem.naturalWidth,

                        altura:
                            imagem.naturalHeight,

                        proporcao:
                            imagem.naturalWidth /
                            imagem.naturalHeight

                    });

                };

            imagem.onerror =
                function() {

                    resolve({

                        largura: 1,

                        altura: 1,

                        proporcao: 1

                    });

                };

            imagem.src =
                url;

        }
    );

}


/************************************************
 TROCAR FOTOS DA APRESENTAÇÃO
************************************************/

async function trocarFotosApresentacao() {

    if (
        !fotosApresentacao ||
        fotosApresentacao.length === 0
    ) {

        return;

    }

    const painel =

        document
        .getElementById(
            "painelApresentacao"
        );

    const quantidade =

        Math.min(

            fotosApresentacao.length,

            5

        );

    const fotosMisturadas =

        [...fotosApresentacao]

        .sort(

            () =>
                Math.random() - 0.5

        )

        .slice(

            0,

            quantidade

        );

    painel.classList.add(
        "painel-trocando"
    );


    setTimeout(
        async function() {

            /*
                Limpa completamente o painel
            */

            painel.innerHTML = "";


            /*
                Remove todas as classes anteriores
                e mantém somente a classe principal
            */

            painel.className =
                "painel-apresentacao";


            /*
                Escolhe SOMENTE entre:

                painel-layout-1
                FOTO GRANDE À ESQUERDA

                painel-layout-4
                FOTO GRANDE À DIREITA
            */

            const layout =
                escolherLayout();


            painel.classList.add(
                layout
            );


            /*
                Carrega as proporções das fotos
            */

            const fotosComProporcao =

                await Promise.all(

                    fotosMisturadas.map(
                        async function(foto) {

                            const dimensoes =

                                await carregarProporcaoImagem(
                                    foto.url
                                );

                            return {

                                ...foto,

                                ...dimensoes

                            };

                        }
                    )

                );


            /*
                Mantém a ordenação por proporção,
                ajudando no enquadramento das fotos
            */

            fotosComProporcao.sort(
                function(a,b) {

                    return (
                        a.proporcao -
                        b.proporcao
                    );

                }
            );


            /*
                ==================================================

                LAYOUT 1
                FOTO GRANDE À ESQUERDA

                A PRIMEIRA FOTO PRECISA SER
                EXPLICITAMENTE O PRIMEIRO ELEMENTO.

                Isso garante que o CSS:

                nth-child(1)

                ocupe corretamente a área grande
                da esquerda.

                ==================================================
            */

            if (
                layout ===
                "painel-layout-1"
            ) {

                fotosComProporcao.forEach(
                    function(foto,index) {

                        const card =
                            document.createElement(
                                "div"
                            );

                        card.className =
                            "foto-apresentacao";


                        /*
                            Classes auxiliares
                            apenas para identificação
                        */

                        if (
                            index === 0
                        ) {

                            card.classList.add(
                                "foto-grande-esquerda"
                            );

                        }

                        else {

                            card.classList.add(
                                "foto-pequena"
                            );

                        }


                        if (
                            foto.proporcao < 0.85
                        ) {

                            card.classList.add(
                                "foto-vertical"
                            );

                        }

                        else if (
                            foto.proporcao > 1.15
                        ) {

                            card.classList.add(
                                "foto-horizontal"
                            );

                        }

                        else {

                            card.classList.add(
                                "foto-quadrada"
                            );

                        }


                        const imagem =
                            document.createElement(
                                "img"
                            );

                        imagem.src =
                            foto.url;

                        imagem.alt =
                            "Foto do casamento";


                        card.appendChild(
                            imagem
                        );


                        painel.appendChild(
                            card
                        );

                    }
                );

            }


            /*
                ==================================================

                LAYOUT 4
                FOTO GRANDE À DIREITA

                O CSS utiliza:

                nth-child(5)

                como a foto grande.

                ==================================================
            */

            else {

                fotosComProporcao.forEach(
                    function(foto,index) {

                        const card =
                            document.createElement(
                                "div"
                            );

                        card.className =
                            "foto-apresentacao";


                        if (
                            index === 4
                        ) {

                            card.classList.add(
                                "foto-grande-direita"
                            );

                        }

                        else {

                            card.classList.add(
                                "foto-pequena"
                            );

                        }


                        if (
                            foto.proporcao < 0.85
                        ) {

                            card.classList.add(
                                "foto-vertical"
                            );

                        }

                        else if (
                            foto.proporcao > 1.15
                        ) {

                            card.classList.add(
                                "foto-horizontal"
                            );

                        }

                        else {

                            card.classList.add(
                                "foto-quadrada"
                            );

                        }


                        const imagem =
                            document.createElement(
                                "img"
                            );

                        imagem.src =
                            foto.url;

                        imagem.alt =
                            "Foto do casamento";


                        card.appendChild(
                            imagem
                        );


                        painel.appendChild(
                            card
                        );

                    }
                );

            }


            painel.classList.remove(
                "painel-trocando"
            );

        },

        500

    );

}


/************************************************
 TELA CHEIA
************************************************/

function alternarTelaCheia() {

    if (
        !document.fullscreenElement
    ) {

        document
            .getElementById(
                "apresentacaoTela"
            )
            .requestFullscreen()
            .catch(
                function(error) {

                    console.error(
                        error
                    );

                }
            );

    }

    else {

        document.exitFullscreen();

    }

}


/************************************************
 SAIR DA APRESENTAÇÃO
************************************************/

function sairApresentacao() {

    clearInterval(
        intervaloApresentacao
    );

    clearInterval(
        intervaloAtualizacaoApresentacao
    );

    intervaloApresentacao =
        null;

    intervaloAtualizacaoApresentacao =
        null;

    if (
        document.fullscreenElement
    ) {

        document.exitFullscreen();

    }

    voltarInicio();

}


/************************************************
 SAIR DA VALIDAÇÃO
************************************************/

function sairValidacao() {

    voltarInicio();

}


/************************************************
 VOLTAR AO INÍCIO
************************************************/

function voltarInicio() {

    esconderTodasTelas();

    document
        .getElementById(
            "inicio"
        )
        .classList
        .remove(
            "escondido"
        );

    document
        .getElementById(
            "senha"
        )
        .value = "";

    document
        .getElementById(
            "erroSenha"
        )
        .innerText = "";

}


/************************************************
 ESCONDER TODAS AS TELAS
************************************************/

function esconderTodasTelas() {

    document
        .getElementById(
            "inicio"
        )
        .classList
        .add(
            "escondido"
        );

    document
        .getElementById(
            "envioTela"
        )
        .classList
        .add(
            "escondido"
        );

    document
        .getElementById(
            "senhaTela"
        )
        .classList
        .add(
            "escondido"
        );

    document
        .getElementById(
            "validacaoTela"
        )
        .classList
        .add(
            "escondido"
        );

    document
        .getElementById(
            "apresentacaoTela"
        )
        .classList
        .add(
            "escondido"
        );

}

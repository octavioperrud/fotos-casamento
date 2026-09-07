

/************************************************

CONFIGURAÇÕES SUPABASE

************************************************/


const SUPABASE_URL =
    "https://gmizhmkichnkzsdaznjg.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_4j1VkO20dQG7R6oMYRMwgA_V9HYVRri";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/************************************************

CONFIGURAÇÕES

************************************************/


const BUCKET =
    "fotos-casamento";



const PASTA_AGUARDANDO =
    "01-Aguardando";



const PASTA_APROVADAS =
    "02-Aprovadas";



const PASTA_REPROVADAS =
    "03-Reprovadas";



const SENHA_ADMIN =
    "CASAMENTO2026";



let arquivoSelecionado =
    null;



/************************************************

ABRIR OPÇÕES DE FOTO

************************************************/


function abrirOpcoesFoto() {

    esconderTodasTelas();


    document
        .getElementById("opcoesFoto")
        .classList
        .remove("escondido");

}



/************************************************

TIRAR FOTO

************************************************/


function tirarFoto() {

    document
        .getElementById("inputCamera")
        .value = "";


    document
        .getElementById("inputCamera")
        .click();

}



/************************************************

ESCOLHER DA GALERIA

************************************************/


function escolherGaleria() {

    document
        .getElementById("inputGaleria")
        .value = "";


    document
        .getElementById("inputGaleria")
        .click();

}



/************************************************

FOTO SELECIONADA

************************************************/


function fotoSelecionada(event) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {

        return;

    }


    arquivoSelecionado =
        arquivo;


    const imagemURL =
        URL.createObjectURL(
            arquivo
        );


    document
        .getElementById("previewImagem")
        .src =
        imagemURL;


    document
        .getElementById("nomeArquivo")
        .innerText =
        arquivo.name;


    document
        .getElementById("statusUpload")
        .innerText =
        "";


    esconderTodasTelas();


    document
        .getElementById("previewTela")
        .classList
        .remove("escondido");

}



/************************************************

ENVIAR FOTO PARA SUPABASE

************************************************/


async function enviarParaServidor() {

    if (!arquivoSelecionado) {

        alert(
            "Nenhuma foto selecionada."
        );

        return;

    }


    const status =
        document
        .getElementById("statusUpload");


    status.innerText =
        "⏳ Enviando sua foto...";


    const extensao =
        arquivoSelecionado.name
        .split(".")
        .pop();


    const agora =
        new Date()
        .toISOString()
        .replace(/[:.]/g, "-");


    const nomeArquivo =
        `foto-${agora}-${Math.random()
        .toString(36)
        .substring(2,8)}.${extensao}`;


    const caminho =
        `${PASTA_AGUARDANDO}/${nomeArquivo}`;


    const {
        data,
        error
    } =
    await supabaseClient
        .storage
        .from(BUCKET)
        .upload(
            caminho,
            arquivoSelecionado,
            {
                cacheControl: "3600",

                upsert: false,

                contentType:
                    arquivoSelecionado.type
            }
        );


    if (error) {

        console.error(error);


        status.innerText =
            "❌ Erro ao enviar a foto: " +
            error.message;


        return;

    }


    status.innerText =
        "✅ Foto enviada com sucesso! Obrigado por compartilhar este momento ❤️";


    arquivoSelecionado =
        null;


    setTimeout(
        () => {

            voltarInicio();

        },
        3000
    );

}



/************************************************

ABRIR SENHA

************************************************/


function abrirSenha() {

    esconderTodasTelas();


    document
        .getElementById("senhaTela")
        .classList
        .remove("escondido");

}



/************************************************

VALIDAR SENHA

************************************************/


function validarSenha() {

    const senha =
        document
        .getElementById("senha")
        .value;


    const erro =
        document
        .getElementById("erroSenha");


    if (
        senha === SENHA_ADMIN
    ) {

        erro.innerText =
            "";


        esconderTodasTelas();


        document
            .getElementById("validacaoTela")
            .classList
            .remove("escondido");


        carregarFotosPendentes();

    }

    else {

        erro.innerText =
            "❌ Senha incorreta!";

    }

}



/************************************************

CARREGAR FOTOS PENDENTES

************************************************/


async function carregarFotosPendentes() {

    const lista =
        document
        .getElementById("listaFotos");


    lista.innerHTML =
        "<p class='sem-fotos'>⏳ Carregando fotos...</p>";


    const {
        data,
        error
    } =
    await supabaseClient
        .storage
        .from(BUCKET)
        .list(
            PASTA_AGUARDANDO,
            {
                limit: 1000,

                offset: 0,

                sortBy: {
                    column: "created_at",
                    order: "desc"
                }
            }
        );


    if (error) {

        console.error(error);


        lista.innerHTML =
            `<p class='sem-fotos'>
                ❌ Erro ao carregar fotos:
                ${error.message}
            </p>`;


        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        lista.innerHTML =
            `<p class='sem-fotos'>
                📭 Não existem fotos aguardando aprovação.
            </p>`;


        return;

    }


    lista.innerHTML =
        "";


    for (
        const arquivo of data
    ) {

        if (
            !arquivo.name
            .match(
                /\.(jpg|jpeg|png|webp|gif)$/i
            )
        ) {

            continue;

        }


        const caminho =
            `${PASTA_AGUARDANDO}/${arquivo.name}`;


        const {
            data: urlData
        } =
        supabaseClient
            .storage
            .from(BUCKET)
            .getPublicUrl(
                caminho
            );


        const imagemURL =
            urlData.publicUrl;


        const card =
            document
            .createElement("div");


        card.className =
            "card-foto";


        card.innerHTML =
            `

            <img
                src="${imagemURL}"
                loading="lazy"
            >

            <p>
                ${arquivo.name}
            </p>


            <button
                class="botao aprovar"
                onclick="aprovarFoto('${arquivo.name}')"
            >

                ✅ Permitir

            </button>


            <button
                class="botao reprovar"
                onclick="reprovarFoto('${arquivo.name}')"
            >

                🚫 Bloquear

            </button>

            `;


        lista.appendChild(
            card
        );

    }

}



/************************************************

APROVAR FOTO

************************************************/


async function aprovarFoto(nomeArquivo) {

    const confirmar =
        confirm(
            "Deseja permitir esta foto?"
        );


    if (!confirmar) {

        return;

    }


    const origem =
        `${PASTA_AGUARDANDO}/${nomeArquivo}`;


    const destino =
        `${PASTA_APROVADAS}/${nomeArquivo}`;


    const {
        error
    } =
    await supabaseClient
        .storage
        .from(BUCKET)
        .move(
            origem,
            destino
        );


    if (error) {

        alert(
            "Erro ao aprovar: " +
            error.message
        );


        return;

    }


    carregarFotosPendentes();

}



/************************************************

REPROVAR FOTO

************************************************/


async function reprovarFoto(nomeArquivo) {

    const confirmar =
        confirm(
            "Deseja bloquear esta foto?"
        );


    if (!confirmar) {

        return;

    }


    const origem =
        `${PASTA_AGUARDANDO}/${nomeArquivo}`;


    const destino =
        `${PASTA_REPROVADAS}/${nomeArquivo}`;


    const {
        error
    } =
    await supabaseClient
        .storage
        .from(BUCKET)
        .move(
            origem,
            destino
        );


    if (error) {

        alert(
            "Erro ao bloquear: " +
            error.message
        );


        return;

    }


    carregarFotosPendentes();

}



/************************************************

VISUALIZAR FOTOS

************************************************/


function visualizarFotos() {

    esconderTodasTelas();


    document
        .getElementById("validacaoTela")
        .classList
        .remove("escondido");


    carregarFotosAprovadas();

}



/************************************************

CARREGAR FOTOS APROVADAS

************************************************/


async function carregarFotosAprovadas() {

    const lista =
        document
        .getElementById("listaFotos");


    lista.innerHTML =
        "<p class='sem-fotos'>⏳ Carregando fotos...</p>";


    const {
        data,
        error
    } =
    await supabaseClient
        .storage
        .from(BUCKET)
        .list(
            PASTA_APROVADAS,
            {
                limit: 1000,

                offset: 0
            }
        );


    if (error) {

        lista.innerHTML =
            `<p class='sem-fotos'>
                ❌ Erro ao carregar fotos.
            </p>`;


        return;

    }


    lista.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        lista.innerHTML =
            `<p class='sem-fotos'>
                📭 Ainda não existem fotos aprovadas.
            </p>`;


        return;

    }


    for (
        const arquivo of data
    ) {

        const caminho =
            `${PASTA_APROVADAS}/${arquivo.name}`;


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
            document
            .createElement("div");


        card.className =
            "card-foto";


        card.innerHTML =
            `

            <img
                src="${urlData.publicUrl}"
                loading="lazy"
            >

            `;


        lista.appendChild(
            card
        );

    }

}



/************************************************

VOLTAR AO INÍCIO

************************************************/


function voltarInicio() {

    esconderTodasTelas();


    document
        .getElementById("inicio")
        .classList
        .remove("escondido");


    document
        .getElementById("senha")
        .value =
        "";


    document
        .getElementById("erroSenha")
        .innerText =
        "";

}



/************************************************

ESCONDER TODAS AS TELAS

************************************************/


function esconderTodasTelas() {

    const telas = [

        "inicio",

        "opcoesFoto",

        "previewTela",

        "senhaTela",

        "validacaoTela"

    ];


    telas.forEach(
        function(id) {

            document
                .getElementById(id)
                .classList
                .add("escondido");

        }
    );

}

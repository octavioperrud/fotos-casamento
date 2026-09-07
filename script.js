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



/************************************************

 ABRIR ENVIO

************************************************/


function abrirEnvio() {


    esconderTodasTelas();


    document
        .getElementById("envioTela")
        .classList
        .remove("escondido");


}



/************************************************

 PREVIEW DA FOTO

************************************************/


document
    .getElementById("fotoInput")
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


    status.innerText =
        "⏳ Enviando foto...";


    const extensao =
        fotoSelecionada.name
        .split(".")
        .pop();


    const nomeArquivo =

        "aguardando/" +

        Date.now() +

        "_" +

        Math.random()
        .toString(36)
        .substring(2,8) +

        "." +

        extensao;


    const {

        data,

        error

    } =

    await supabaseClient
        .storage
        .from(BUCKET)
        .upload(

            nomeArquivo,

            fotoSelecionada,

            {

                cacheControl:
                    "3600",

                upsert:
                    false

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
        "✅ Foto enviada com sucesso! Obrigado por compartilhar esse momento ❤️";


    fotoSelecionada =
        null;


    document
        .getElementById("fotoInput")
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
        .getElementById("senha")
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


        console.error(error);


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

        data,

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


        console.error(error);


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

        data,

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


        console.error(error);


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


    /*
        MOSTRA O BOTÃO SAIR
        NO TOPO DAS FOTOS APROVADAS
    */

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
        .getElementById("inicio")
        .classList
        .remove("escondido");


    document
        .getElementById("senha")
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
        .getElementById("inicio")
        .classList
        .add("escondido");


    document
        .getElementById("envioTela")
        .classList
        .add("escondido");


    document
        .getElementById("senhaTela")
        .classList
        .add("escondido");


    document
        .getElementById("validacaoTela")
        .classList
        .add("escondido");


}

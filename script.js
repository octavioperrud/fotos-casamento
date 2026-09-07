/************************************************
 CONFIGURAÇÕES
************************************************/

const SENHA_ADMIN = "CASAMENTO2026";

const LINK_FOTOS_APROVADAS =
    "https://1drv.ms/f/c/f203919d62721e53/IgDBWH5vRVqcTLP_ennS0ThFAbzVWbGUZoULU9zM_F_M4iM?e=bw1XGR";


/************************************************
 VARIÁVEIS
************************************************/

let fotosSelecionadas = [];


/************************************************
 BANCO LOCAL - INDEXEDDB
************************************************/

function abrirBanco() {

    return new Promise((resolve, reject) => {

        const pedido =
            indexedDB.open(
                "FotosCasamento",
                1
            );


        pedido.onupgradeneeded =
            function(event) {

                const banco =
                    event.target.result;


                if (
                    !banco.objectStoreNames
                        .contains("fotos")
                ) {

                    banco.createObjectStore(
                        "fotos",
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                }

            };


        pedido.onsuccess =
            function(event) {

                resolve(
                    event.target.result
                );

            };


        pedido.onerror =
            function(event) {

                reject(event.target.error);

            };

    });

}


/************************************************
 ABRIR TELA ENVIAR FOTO
************************************************/

function abrirEnviarFoto() {

    esconderTodas();

    document
        .getElementById("enviarTela")
        .classList
        .remove("escondido");

}


/************************************************
 ABRIR CAMERA / GALERIA
************************************************/

function tirarFoto() {

    document
        .getElementById("inputFoto")
        .click();

}


/************************************************
 QUANDO ESCOLHER FOTO
************************************************/

document
    .getElementById("inputFoto")
    .addEventListener(
        "change",
        function(event) {

            fotosSelecionadas =
                Array.from(
                    event.target.files
                );


            mostrarPreview();

        }
    );


/************************************************
 MOSTRAR PREVIEW
************************************************/

function mostrarPreview() {

    const area =
        document.getElementById(
            "previewFotos"
        );


    area.innerHTML = "";


    fotosSelecionadas.forEach(
        function(foto) {

            const leitor =
                new FileReader();


            leitor.onload =
                function(event) {

                    const imagem =
                        document.createElement("img");


                    imagem.src =
                        event.target.result;


                    imagem.className =
                        "preview-imagem";


                    area.appendChild(
                        imagem
                    );

                };


            leitor.readAsDataURL(
                foto
            );

        }
    );


    if (
        fotosSelecionadas.length > 0
    ) {

        document
            .getElementById("botaoEnviar")
            .style.display = "block";

    }

}


/************************************************
 ENVIAR PARA VALIDAÇÃO
************************************************/

async function enviarParaValidacao() {

    if (
        fotosSelecionadas.length === 0
    ) {

        alert(
            "Escolha pelo menos uma foto."
        );

        return;

    }


    const banco =
        await abrirBanco();


    const transacao =
        banco.transaction(
            "fotos",
            "readwrite"
        );


    const tabela =
        transacao.objectStore(
            "fotos"
        );


    fotosSelecionadas.forEach(
        function(foto) {

            tabela.add({

                arquivo: foto,

                nome: foto.name,

                data:
                    new Date()
                    .toISOString(),

                status: "pendente"

            });

        }
    );


    transacao.oncomplete =
        function() {

            alert(
                "✅ Foto(s) enviada(s) para validação!"
            );


            fotosSelecionadas = [];


            document
                .getElementById("inputFoto")
                .value = "";


            document
                .getElementById("previewFotos")
                .innerHTML = "";


            document
                .getElementById("botaoEnviar")
                .style.display = "none";


            voltarInicio();

        };

}


/************************************************
 ABRIR SENHA
************************************************/

function abrirSenha() {

    esconderTodas();


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


    if (
        senha === SENHA_ADMIN
    ) {

        esconderTodas();


        document
            .getElementById("validacaoTela")
            .classList
            .remove("escondido");


        carregarFotosPendentes();

    }

    else {

        document
            .getElementById("erroSenha")
            .innerText =
                "❌ Senha incorreta.";

    }

}


/************************************************
 CARREGAR FOTOS
************************************************/

async function carregarFotosPendentes() {

    const banco =
        await abrirBanco();


    const transacao =
        banco.transaction(
            "fotos",
            "readonly"
        );


    const tabela =
        transacao.objectStore(
            "fotos"
        );


    const pedido =
        tabela.getAll();


    pedido.onsuccess =
        function() {

            const fotos =
                pedido.result.filter(
                    foto =>
                        foto.status ===
                        "pendente"
                );


            mostrarFotosPendentes(
                fotos
            );

        };

}


/************************************************
 MOSTRAR FOTOS
************************************************/

function mostrarFotosPendentes(
    fotos
) {

    const lista =
        document.getElementById(
            "listaFotos"
        );


    const contador =
        document.getElementById(
            "contadorFotos"
        );


    lista.innerHTML = "";


    contador.innerText =
        fotos.length +
        " foto(s) aguardando";


    if (
        fotos.length === 0
    ) {

        lista.innerHTML = `

            <div class="sem-fotos">

                📭

                <h3>
                    Nenhuma foto pendente
                </h3>

            </div>

        `;

        return;

    }


    fotos.forEach(
        function(foto) {

            const url =
                URL.createObjectURL(
                    foto.arquivo
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "foto-card";


            card.innerHTML = `

                <img
                    src="${url}">

                <p>
                    ${foto.nome}
                </p>

                <div
                    class="acoes">

                    <button
                        class="permitir"
                        onclick="permitirFoto(${foto.id})">

                        ✓ Permitir

                    </button>

                    <button
                        class="bloquear"
                        onclick="bloquearFoto(${foto.id})">

                        ✕ Bloquear

                    </button>

                </div>

            `;


            lista.appendChild(
                card
            );

        }
    );

}


/************************************************
 PERMITIR FOTO
************************************************/

async function permitirFoto(id) {

    await alterarStatus(
        id,
        "aprovada"
    );


    alert(
        "✅ Foto aprovada!"
    );


    carregarFotosPendentes();

}


/************************************************
 BLOQUEAR FOTO
************************************************/

async function bloquearFoto(id) {

    if (
        confirm(
            "Deseja bloquear esta foto?"
        )
    ) {

        await alterarStatus(
            id,
            "bloqueada"
        );


        carregarFotosPendentes();

    }

}


/************************************************
 ALTERAR STATUS
************************************************/

async function alterarStatus(
    id,
    novoStatus
) {

    const banco =
        await abrirBanco();


    const transacao =
        banco.transaction(
            "fotos",
            "readwrite"
        );


    const tabela =
        transacao.objectStore(
            "fotos"
        );


    const pedido =
        tabela.get(id);


    pedido.onsuccess =
        function() {

            const foto =
                pedido.result;


            foto.status =
                novoStatus;


            tabela.put(
                foto
            );

        };

}


/************************************************
 VISUALIZAR APROVADAS
************************************************/

function visualizarFotos() {

    window.open(
        LINK_FOTOS_APROVADAS,
        "_blank"
    );

}


/************************************************
 VOLTAR AO INÍCIO
************************************************/

function voltarInicio() {

    esconderTodas();


    document
        .getElementById("inicio")
        .classList
        .remove("escondido");

}


/************************************************
 ESCONDER TODAS
************************************************/

function esconderTodas() {

    document
        .getElementById("inicio")
        .classList
        .add("escondido");


    document
        .getElementById("enviarTela")
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


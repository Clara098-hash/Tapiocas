// Variáveis para armazenar os preços da base e dos recheios
let basePrice = 0;
let toppingPrice = 0;
let baseName = ''; // Variável para armazenar o nome da base
let selectedBases = []; // Array para armazenar as bases selecionadas
let selectedToppings = []; // Array para armazenar os recheios selecionados

// Função para carregar as bases (alimentos)
async function loadFoods() {
    const baseOptions = document.getElementById('base-options');
    try {
        console.log('Iniciando a requisição para /foods...');

        const response = await fetch('http://localhost:8080/foods'); // Alterar para o URL correto

        // Verificar se a resposta está OK
        if (!response.ok) {
            throw new Error(`Erro ao carregar alimentos: ${response.statusText}`);
        }

        const foods = await response.json();
        console.log('Dados recebidos:', foods);

        baseOptions.innerHTML = '';  // Limpa as opções anteriores

        foods.forEach(food => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';  // Alterado para radio
            radio.name = 'base';  // Usando o mesmo nome para manter a consistência
            radio.value = food.name;
            radio.onchange = () => selectBase(food.id, food.name, food.price, radio.checked); // Passa o estado de checked para a função selectBase
            label.appendChild(radio);
            label.appendChild(document.createTextNode(`${food.name} - R$${food.price.toFixed(2)}`));

            baseOptions.appendChild(label);
        });
    } catch (error) {
        console.error('Erro ao carregar alimentos:', error);
        alert('Erro ao carregar alimentos. Verifique a conexão ou tente novamente mais tarde.');
    }
}


// Função para selecionar a base (Tapioca, Cuscuz, Sanduíche)
function selectBase(idFood, name, price, isChecked) {
    if (isChecked) {
        // Adiciona a base ao array de bases selecionadas
        selectedBases = [{ id: idFood, name: name, price: price }];  // Garantir que só uma base será selecionada
    }

    // Exibe a base escolhida
    updatePreview();

    // Limpa os recheios escolhidos ao mudar a base
    selectedToppings = []; // Limpa os toppings selecionados

    // Exibe a área de preview limpa
    updatePreview();
    updateTotal();

    // Chama a função para carregar os recheios relacionados a essa base
    if (isChecked) {
        loadToppings(idFood);
    } else {
        // Se a base for desmarcada, você pode limpar os recheios relacionados a ela
        const toppingsOptions = document.getElementById('recheios');
        toppingsOptions.innerHTML = '';  // Limpa os recheios carregados para esta base
    }
}

// Função para carregar os recheios (filings)
async function loadToppings(foodId) {
    const toppingsOptions = document.getElementById('recheios');
    try {
        console.log('Iniciando a requisição para /filings...');

        const response = await fetch(`http://localhost:8080/filings?idFood=${foodId}`); // Altere a URL conforme o endpoint do backend
        if (!response.ok) {
            throw new Error('Erro ao carregar recheios');
        }

        const filings = await response.json();

        console.log('Dados recebidos:', filings);

        toppingsOptions.innerHTML = '';  // Limpa as opções anteriores

        filings.filings.forEach(filing => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'topping';
            checkbox.value = filing.name;
            checkbox.onchange = () => selectTopping(filing.name, filing.price, checkbox.checked); // Chama a função selectTopping
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${filing.name} - R$${filing.price.toFixed(2)}`));

            toppingsOptions.appendChild(label);
        });
    } catch (error) {
        console.error('Erro ao carregar recheios:', error);
        alert('Erro ao carregar recheios. Verifique a conexão ou tente novamente mais tarde.');
    }
}

// Função para selecionar os recheios
function selectTopping(name, price, isChecked) {
    if (isChecked) {
        // Adiciona o recheio ao array de recheios selecionados
        selectedToppings.push({ name, price });
    } else {
        // Remove o recheio do array de recheios selecionados
        selectedToppings = selectedToppings.filter(topping => topping.name !== name);
    }

    // Atualiza a área de preview
    updatePreview();

    // Atualiza o total
    updateTotal();
}

// Função para atualizar a área de preview
function updatePreview() {
    const preview = document.getElementById('preview');
    let previewText = '';

    // Exibe as bases escolhidas
    if (selectedBases.length > 0) {
        previewText += '<div class="group-title">Bases escolhidas:</div>';
        selectedBases.forEach(base => {
            previewText += `<div>${base.name} - R$${base.price.toFixed(2)}</div>`;
        });
    }

    // Exibe os recheios escolhidos
    if (selectedToppings.length > 0) {
        previewText += '<div class="group-title">Recheios escolhidos:</div>';
        selectedToppings.forEach(topping => {
            previewText += `<div>${topping.name} - R$${topping.price.toFixed(2)}</div>`;
        });
    }

    preview.innerHTML = previewText;
}

// Função para calcular o total e exibir no summary
function updateTotal() {
    const total = selectedBases.reduce((sum, base) => sum + base.price, 0) + selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    const summary = document.getElementById('summary');
    summary.innerHTML = `Total: R$${total.toFixed(2)}`;
}

// Chama a função loadFoods quando a página for carregada
window.onload = function() {
    console.log('Página carregada, chamando loadFoods...');
    loadFoods();
};

function validateCpf(cpf) {
    // Expressão regular para verificar se o CPF contém apenas números, pontos e traços
    const cpfRegex = /^[0-9.-]+$/;
    return cpfRegex.test(cpf);
}

async function submitOrder() {
    const cpf = document.getElementById('cpf').value;

    // Verifica se o CPF é válido
    if (!validateCpf(cpf)) {
        // Exibe o popup de erro de CPF
        document.getElementById('cpfErrorPopup').style.display = 'block';
        return;
    }

    // Calcula o valor total da base e adicionais
    const total = selectedBases.reduce((sum, base) => sum + base.price, 0) + 
                  selectedToppings.reduce((sum, topping) => sum + topping.price, 0);

    // Verifica se há pelo menos uma base selecionada
    if (selectedBases.length === 0) {
        alert('Por favor, selecione ao menos uma base.');
        return;
    }

    // Monta a requisição para enviar ao servidor
    const paymentRequest = {
        cpf: cpf,
        idFood: selectedBases[0].id, // Considera apenas a primeira base selecionada
        description: `${selectedBases.map(base => base.name).join(", ")} com ${selectedToppings.map(topping => topping.name).join(", ")}`,
        additionalPrice: parseFloat(selectedToppings.reduce((sum, topping) => sum + topping.price, 0).toFixed(2)) // Preço adicional formatado
    };

    try {
        const response = await fetch('http://localhost:8080/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentRequest), // Converte o objeto em JSON
        });

        // Processa a resposta
        const result = await response.json();
        if (response.ok) {
            // Mensagem de sucesso
            document.getElementById('messageBox').innerText = `Venda realizada com sucesso! ID da venda: ${result.saleId}`;
            document.getElementById('messageBox').style.backgroundColor = 'green';
            document.getElementById('messageBox').style.color = 'white';

            // Exibe o modal de sucesso
            document.getElementById('messageModal').style.display = 'block';

            // Limpa os dados do formulário
            selectedBases = [];
            selectedToppings = [];

            // Atualiza a visualização e o total
            updatePreview();
            updateTotal();

            // Desmarcar o radio da base
            const radios = document.querySelectorAll('input[name="base"]');
            radios.forEach(radio => radio.checked = false);

            // Desmarcar os checkboxes de recheio
            const checkboxes = document.querySelectorAll('input[name="topping"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);

        } else {
            // Mensagem de erro
            document.getElementById('messageBox').innerText = `Erro: ${result.error || 'Erro desconhecido'}`;
            document.getElementById('messageBox').style.backgroundColor = 'red';
            document.getElementById('messageBox').style.color = 'white';

            // Exibe o modal de erro
            document.getElementById('messageModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao processar o pagamento:', error);
        alert('Erro ao processar o pagamento. Tente novamente mais tarde.');
    }
}

// Função para fechar o popup de erro do CPF
document.getElementById('closePopupBtn').addEventListener('click', function() {
    document.getElementById('cpfErrorPopup').style.display = 'none';
});

// Função para fechar o modal de sucesso/erro
document.getElementById('messageClose').addEventListener('click', function() {
    document.getElementById('messageModal').style.display = 'none';
});

// Fechar o modal quando o usuário clicar fora da área do modal
window.onclick = function(event) {
    if (event.target === document.getElementById('messageModal')) {
        document.getElementById('messageModal').style.display = 'none';
    }
}

// Função para exibir o histórico de compras
function viewHistory() {
    const cpf = document.getElementById('cpf').value; // Obtém o CPF inserido pelo usuário

    // Validação do CPF
    if (!cpf) {
        alert('Por favor, insira o CPF.');
        return;
    }

    // Envia uma requisição para o backend para buscar o histórico de compras usando o CPF
    fetch(`http://localhost:8080/history?cpf=${cpf}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Verifique a estrutura dos dados aqui

            const salesHistoryDiv = document.getElementById('salesHistory');
            salesHistoryDiv.innerHTML = ""; // Limpa o conteúdo da div

            // Verifica se o array de histórico está vazio
            if (Array.isArray(data) && data.length === 0) {
                salesHistoryDiv.innerHTML = "<p>Nenhuma compra encontrada para este CPF.</p>";
                openModal(); // Abre o modal se não houver compras
                return;
            }

            // Exibe as compras no modal
            data.forEach(sale => {
                const saleDiv = document.createElement('div');
                saleDiv.classList.add('sale');
                let formattedDate = '';

                // Converte a string de data para o formato Date e exibe corretamente
                if (sale.datesale) {
                    const saleDate = new Date(...sale.datesale);  // Usa o spread operator para passar o array como parâmetros
                    if (!isNaN(saleDate)) {
                        formattedDate = saleDate.toLocaleString('pt-BR');  // Formata a data no padrão pt-BR
                    } else {
                        formattedDate = 'Data inválida';
                    }
                } else {
                    formattedDate = 'Data não fornecida';
                }
                

                saleDiv.innerHTML = `
                    <p><strong>ID:</strong> ${sale.id}</p>  <!-- Exibe o ID da venda -->
                    <p><strong>CPF:</strong> ${sale.cpf}</p>  <!-- Exibe o CPF -->
                    <p><strong>Data:</strong> ${formattedDate}</p>  <!-- Exibe a data formatada -->
                    <p><strong>Descrição:</strong> ${sale.description}</p>  <!-- Exibe a descrição -->
                    <p><strong>Preço:</strong> R$ ${sale.price.toFixed(2)}</p>  <!-- Exibe o preço -->
                `;
                salesHistoryDiv.appendChild(saleDiv);
            });

            openModal(); // Abre o modal após exibir as compras
        })
        .catch(error => {
            console.error('Erro ao buscar histórico de compras:', error);
            alert('Erro ao buscar histórico de compras.');
        });
}

// Função para abrir o modal
function openModal() {
    document.getElementById('salesHistoryModal').style.display = 'block';
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('salesHistoryModal').style.display = 'none';
}


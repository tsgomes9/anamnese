document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('botoxForm');
    const btnLimpar = document.getElementById('btnLimpar');
    const btnGerarPDF = document.getElementById('btnGerarPDF');

    // Função para formatar data
    function formatarData(dataString) {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Função para calcular idade
    function calcularIdade(dataNascimento) {
        if (!dataNascimento) return '';
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    // Função para criar o PDF
    function gerarPDF() {
        // Verificar campos obrigatórios
        const camposObrigatorios = ['pacNome', 'pacCPF', 'pacNasc', 'pacTel', 'profNome', 'profRegistro', 'marca', 'lote', 'validade', 'qtdTotal'];
        let formularioValido = true;
        let primeiroCampoInvalido = null;

        camposObrigatorios.forEach(id => {
            const campo = document.getElementById(id);
            if (!campo.value.trim()) {
                campo.style.borderColor = 'red';
                formularioValido = false;
                if (!primeiroCampoInvalido) primeiroCampoInvalido = campo;
            } else {
                campo.style.borderColor = '';
            }
        });

        // Verificar checkbox de consentimento
        const consentimento = document.getElementById('consentimento');
        if (!consentimento.checked) {
            alert('Você deve aceitar o termo de consentimento para gerar o documento.');
            return;
        }

        if (!formularioValido) {
            alert('Por favor, preencha todos os campos obrigatórios (marcados com *).');
            if (primeiroCampoInvalido) {
                primeiroCampoInvalido.focus();
            }
            return;
        }

        // Coletar dados do formulário
        const dados = {
            // Dados do Paciente
            paciente: {
                nome: document.getElementById('pacNome').value,
                cpf: document.getElementById('pacCPF').value,
                nascimento: formatarData(document.getElementById('pacNasc').value),
                idade: calcularIdade(document.getElementById('pacNasc').value),
                telefone: document.getElementById('pacTel').value,
                email: document.getElementById('pacEmail').value || 'Não informado',
                endereco: document.getElementById('pacEndereco').value || 'Não informado'
            },
            // Dados do Profissional
            profissional: {
                nome: document.getElementById('profNome').value,
                especialidade: document.getElementById('profEspecialidade').value || 'Não informada',
                registro: document.getElementById('profRegistro').value,
                clinica: document.getElementById('profClinica').value || 'Não informada',
                endereco: document.getElementById('profEndereco').value || 'Não informado'
            },
            // Histórico Clínico
            historico: {
                alergias: document.getElementById('alergias').value || 'Nega',
                medicamentos: document.getElementById('medicamentos').value || 'Nega',
                doencas: document.getElementById('doencas').value || 'Nega',
                historicoBotox: document.getElementById('historicoBotox').value || 'Nega',
                reacoes: document.getElementById('reacoes').value || 'Nega'
            },
            // Aplicação
            aplicacao: {
                marca: document.getElementById('marca').value,
                lote: document.getElementById('lote').value,
                validade: formatarData(document.getElementById('validade').value),
                qtdTotal: document.getElementById('qtdTotal').value + ' UI'
            },
            // Regiões
            regioes: {
                testa: document.getElementById('regTesta').value || '0',
                glabela: document.getElementById('regGlabela').value || '0',
                peDir: document.getElementById('regPeDir').value || '0',
                peEsq: document.getElementById('regPeEsq').value || '0',
                masseterDir: document.getElementById('regMasseterDir').value || '0',
                masseterEsq: document.getElementById('regMasseterEsq').value || '0',
                mento: document.getElementById('regMento').value || '0',
                outras: document.getElementById('regOutras').value || '-'
            },
            observacoes: document.getElementById('observacoes').value || 'Nenhuma observação registrada.'
        };

        // Criar PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Configurações de estilo
        const margemEsquerda = 20;
        const margemDireita = 190;
        const larguraColuna = (margemDireita - margemEsquerda) / 2;
        let y = 20;

        // Funções auxiliares para o PDF
        function addTitulo(texto, cor = [44, 62, 80]) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(cor[0], cor[1], cor[2]);
            doc.text(texto, margemEsquerda, y);
            y += 8;
        }

        function addLinha() {
            doc.setDrawColor(212, 175, 55); // Dourado
            doc.setLineWidth(0.5);
            doc.line(margemEsquerda, y, margemDireita, y);
            y += 5;
        }

        function addTabela(linhas, colunas) {
            // linhas: array de objetos com label e valor
            // colunas: número de colunas (1 ou 2)
            const alturaLinha = 8;
            const padding = 3;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            if (colunas === 2) {
                for (let i = 0; i < linhas.length; i += 2) {
                    // Primeira coluna
                    doc.setFont('helvetica', 'bold');
                    doc.text(linhas[i].label + ':', margemEsquerda, y);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(linhas[i].valor), margemEsquerda + 35, y);
                    
                    // Segunda coluna (se existir)
                    if (linhas[i + 1]) {
                        doc.setFont('helvetica', 'bold');
                        doc.text(linhas[i + 1].label + ':', margemEsquerda + 95, y);
                        doc.setFont('helvetica', 'normal');
                        doc.text(String(linhas[i + 1].valor), margemEsquerda + 130, y);
                    }
                    
                    y += alturaLinha;
                    
                    // Verificar se precisa de nova página
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                }
            } else {
                linhas.forEach(item => {
                    doc.setFont('helvetica', 'bold');
                    doc.text(item.label + ':', margemEsquerda, y);
                    doc.setFont('helvetica', 'normal');
                    
                    // Quebrar texto longo
                    const valor = String(item.valor);
                    const linhasValor = doc.splitTextToSize(valor, 150);
                    
                    doc.text(linhasValor[0], margemEsquerda + 45, y);
                    y += alturaLinha;
                    
                    // Linhas adicionais do valor
                    for (let i = 1; i < linhasValor.length; i++) {
                        doc.text(linhasValor[i], margemEsquerda + 45, y);
                        y += alturaLinha;
                    }
                    
                    // Verificar página
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                });
            }
            y += 3;
        }

        // CABEÇALHO
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text('REGISTRO DE APLICAÇÃO DE TOXINA BOTULÍNICA', 105, y, { align: 'center' });
        y += 8;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(127, 140, 141);
        doc.text('Harmonização Orofacial - Documento Clínico', 105, y, { align: 'center' });
        y += 5;
        
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;

        // DATA DO DOCUMENTO
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 190, y, { align: 'right' });
        y += 5;

        // 1. DADOS DO PACIENTE
        addTitulo('1. DADOS DO PACIENTE');
        addTabela([
            { label: 'Nome', valor: dados.paciente.nome },
            { label: 'CPF', valor: dados.paciente.cpf },
            { label: 'Nascimento', valor: dados.paciente.nascimento },
            { label: 'Idade', valor: dados.paciente.idade + ' anos' },
            { label: 'Telefone', valor: dados.paciente.telefone },
            { label: 'Email', valor: dados.paciente.email }
        ], 2);
        
        addTabela([
            { label: 'Endereço', valor: dados.paciente.endereco }
        ], 1);
        addLinha();

        // 2. DADOS DO PROFISSIONAL
        addTitulo('2. DADOS DO PROFISSIONAL');
        addTabela([
            { label: 'Nome', valor: dados.profissional.nome },
            { label: 'Registro', valor: dados.profissional.registro },
            { label: 'Especialidade', valor: dados.profissional.especialidade },
            { label: 'Clínica', valor: dados.profissional.clinica }
        ], 2);
        
        addTabela([
            { label: 'Endereço da Clínica', valor: dados.profissional.endereco }
        ], 1);
        addLinha();

        // 3. HISTÓRICO CLÍNICO
        addTitulo('3. HISTÓRICO CLÍNICO');
        addTabela([
            { label: 'Alergias', valor: dados.historico.alergias },
            { label: 'Medicamentos', valor: dados.historico.medicamentos },
            { label: 'Doenças Crônicas', valor: dados.historico.doencas },
            { label: 'Já fez Botox?', valor: dados.historico.historicoBotox },
            { label: 'Reações Adversas', valor: dados.historico.reacoes }
        ], 1);
        addLinha();

        // 4. REGISTRO DA APLICAÇÃO
        addTitulo('4. REGISTRO DA APLICAÇÃO');
        addTabela([
            { label: 'Marca', valor: dados.aplicacao.marca },
            { label: 'Lote', valor: dados.aplicacao.lote },
            { label: 'Validade', valor: dados.aplicacao.validade },
            { label: 'Total UI', valor: dados.aplicacao.qtdTotal }
        ], 2);

        // Tabela de distribuição por região
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('DISTRIBUIÇÃO POR REGIÃO (UI)', margemEsquerda, y);
        y += 7;

        // Desenhar tabela de regiões
        const colunas = ['Região', 'UI', 'Região', 'UI'];
        const posicoes = [margemEsquerda, margemEsquerda + 40, margemEsquerda + 95, margemEsquerda + 135];
        
        // Cabeçalho da tabela
        doc.setFillColor(240, 240, 240);
        doc.rect(margemEsquerda, y - 4, 170, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        colunas.forEach((col, i) => {
            doc.text(col, posicoes[i], y);
        });
        y += 6;

        // Dados da tabela
        doc.setFont('helvetica', 'normal');
        const regioes = [
            ['Testa (Frontal)', dados.regioes.testa + ' UI', 'Glabela', dados.regioes.glabela + ' UI'],
            ['Pés de Galinha (Dir)', dados.regioes.peDir + ' UI', 'Pés de Galinha (Esq)', dados.regioes.peEsq + ' UI'],
            ['Masseter (Dir)', dados.regioes.masseterDir + ' UI', 'Masseter (Esq)', dados.regioes.masseterEsq + ' UI'],
            ['Mento', dados.regioes.mento + ' UI', 'Outras', dados.regioes.outras]
        ];

        regioes.forEach(linha => {
            doc.text(linha[0], posicoes[0], y);
            doc.text(linha[1], posicoes[1], y);
            doc.text(linha[2], posicoes[2], y);
            doc.text(linha[3], posicoes[3], y);
            y += 6;
            
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });
        y += 5;
        addLinha();

        // 5. OBSERVAÇÕES
        addTitulo('5. OBSERVAÇÕES DO PROCEDIMENTO');
        addTabela([
            { label: '', valor: dados.observacoes }
        ], 1);
        addLinha();

        // 6. TERMO DE CONSENTIMENTO
        addTitulo('6. TERMO DE CONSENTIMENTO');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        
        const termo = [
            'Declaro que li, compreendi e aceito os termos do consentimento livre e esclarecido para',
            'aplicação de toxina botulínica. Fui informado(a) sobre a natureza do procedimento, resultados',
            'esperados, riscos, efeitos adversos possíveis e orientações pós-procedimento. Tive a',
            'oportunidade de esclarecer todas as minhas dúvidas e as informações prestadas no histórico',
            'clínico são verdadeiras.'
        ];
        
        termo.forEach(linha => {
            doc.text(linha, margemEsquerda, y);
            y += 5;
        });
        y += 5;

        // ASSINATURAS
        doc.setLineWidth(0.5);
        doc.line(margemEsquerda, y, margemEsquerda + 70, y);
        doc.line(margemDireita - 70, y, margemDireita, y);
        
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Assinatura do Paciente', margemEsquerda, y);
        doc.text('Assinatura do Profissional', margemDireita - 70, y);

        // RODAPÉ
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento válido como registro clínico', 105, 285, { align: 'center' });

        // Salvar PDF
        const nomeArquivo = `toxina_${dados.paciente.nome.split(' ')[0]}_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(nomeArquivo);
    }

    // Event Listeners
    btnGerarPDF.addEventListener('click', gerarPDF);

    btnLimpar.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            form.reset();
            // Remover bordas vermelhas
            document.querySelectorAll('input, textarea').forEach(campo => {
                campo.style.borderColor = '';
            });
        }
    });

    // Máscara para CPF
    document.getElementById('pacCPF').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        }
    });

    // Máscara para Telefone
    document.getElementById('pacTel').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Calcular total automático
    const camposUI = ['regTesta', 'regGlabela', 'regPeDir', 'regPeEsq', 'regMasseterDir', 'regMasseterEsq', 'regMento'];
    camposUI.forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            let total = 0;
            camposUI.forEach(campoId => {
                const valor = parseInt(document.getElementById(campoId).value) || 0;
                total += valor;
            });
            document.getElementById('qtdTotal').value = total;
        });
    });
});

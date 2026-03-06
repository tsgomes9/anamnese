document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('botoxForm');
    const btnGerarPDF = document.getElementById('btnGerarPDF');
    const btnLimpar = document.getElementById('btnLimpar');
    
    // Botão Limpar
    btnLimpar.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja limpar todo o formulário?')) {
            form.reset();
            window.scrollTo(0, 0);
        }
    });

    // Botão Gerar PDF
    btnGerarPDF.addEventListener('click', async (e) => {
        e.preventDefault();

        // Validação básica
        if (!form.checkValidity()) {
            alert('Por favor, preencha todos os campos obrigatórios e aceite o termo de consentimento.');
            form.reportValidity();
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurações de Cores
        const primaryColor = [44, 62, 80]; // Azul Escuro
        const secondaryColor = [52, 152, 219]; // Azul Claro
        const lightGray = [245, 245, 245]; // Cinza Claro
        const darkGray = [100, 100, 100]; // Cinza Escuro

        // Dimensões A4
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // --- PÁGINA 1: FORMULÁRIO ---

        // Cabeçalho
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('REGISTRO CLÍNICO', margin, 12);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('APLICAÇÃO DE TOXINA BOTULÍNICA', margin, 20);

        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 12, { align: 'right' });
        doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, 20, { align: 'right' });

        let y = 40;

        // Função para desenhar caixa de seção
        function drawSectionBox(title, height, yPos) {
            doc.setFillColor(...lightGray);
            doc.rect(margin, yPos, contentWidth, height, 'F');
            
            doc.setFillColor(...secondaryColor);
            doc.rect(margin, yPos, 3, height, 'F'); // Barra lateral azul
            
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(title.toUpperCase(), margin + 5, yPos + 6);
        }

        // 1. DADOS DO PACIENTE E PROFISSIONAL (Lado a Lado)
        const boxHeight = 45;
        
        // Coluna 1: Paciente
        doc.setFillColor(...lightGray);
        doc.rect(margin, y, (contentWidth / 2) - 2, boxHeight, 'F');
        doc.setFillColor(...secondaryColor);
        doc.rect(margin, y, 1, boxHeight, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DADOS DO PACIENTE', margin + 4, y + 5);
        
        const pacNome = document.getElementById('pacNome').value;
        const pacCPF = document.getElementById('pacCPF').value;
        const pacNasc = document.getElementById('pacNasc').value;
        const pacTel = document.getElementById('pacTel').value;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`Nome: ${pacNome}`, margin + 4, y + 12);
        doc.text(`CPF: ${pacCPF}`, margin + 4, y + 18);
        doc.text(`Nasc: ${pacNasc ? new Date(pacNasc).toLocaleDateString('pt-BR') : ''}`, margin + 4, y + 24);
        doc.text(`Tel: ${pacTel}`, margin + 4, y + 30);

        // Coluna 2: Profissional
        const col2X = margin + (contentWidth / 2) + 2;
        doc.setFillColor(...lightGray);
        doc.rect(col2X, y, (contentWidth / 2) - 2, boxHeight, 'F');
        doc.setFillColor(...secondaryColor);
        doc.rect(col2X, y, 1, boxHeight, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DADOS DO PROFISSIONAL', col2X + 4, y + 5);
        
        const profNome = document.getElementById('profNome').value;
        const profRegistro = document.getElementById('profRegistro').value;
        const profClinica = document.getElementById('profClinica').value;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`Nome: ${profNome}`, col2X + 4, y + 12);
        doc.text(`Registro: ${profRegistro}`, col2X + 4, y + 18);
        doc.text(`Clínica: ${profClinica}`, col2X + 4, y + 24);

        y += boxHeight + 5;

        // 2. HISTÓRICO CLÍNICO
        const histHeight = 35;
        drawSectionBox('Histórico Clínico', histHeight, y);
        
        const alergias = document.getElementById('alergias').value || 'Nega';
        const medicamentos = document.getElementById('medicamentos').value || 'Nega';
        const doencas = document.getElementById('doencas').value || 'Nega';
        const historicoBotox = document.getElementById('historicoBotox').value || 'Não informado';

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        // Grid de histórico
        doc.text(`Alergias: ${alergias}`, margin + 5, y + 12);
        doc.text(`Medicamentos: ${medicamentos}`, margin + 5, y + 18);
        doc.text(`Doenças: ${doencas}`, margin + 5, y + 24);
        doc.text(`Histórico Botox: ${historicoBotox}`, margin + 5, y + 30);

        y += histHeight + 5;

        // 3. REGISTRO DA APLICAÇÃO
        const appHeight = 70;
        drawSectionBox('Registro da Aplicação', appHeight, y);
        
        const marca = document.getElementById('marca').value;
        const lote = document.getElementById('lote').value;
        const validade = document.getElementById('validade').value;
        const qtdTotal = document.getElementById('qtdTotal').value;

        doc.setFontSize(9);
        doc.text(`Marca: ${marca} | Lote: ${lote} | Validade: ${validade ? new Date(validade).toLocaleDateString('pt-BR') : ''} | Total: ${qtdTotal} UI`, margin + 5, y + 12);

        // Tabela de Regiões
        const tableY = y + 18;
        const colWidth = contentWidth / 4;
        
        doc.setFillColor(230, 230, 230);
        doc.rect(margin + 5, tableY, contentWidth - 10, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Mapeamento de Unidades (UI)', margin + 7, tableY + 4);

        const regioes = [
            { l: 'Testa', v: document.getElementById('regTesta').value },
            { l: 'Glabela', v: document.getElementById('regGlabela').value },
            { l: 'Pés Galinha (D)', v: document.getElementById('regPeDir').value },
            { l: 'Pés Galinha (E)', v: document.getElementById('regPeEsq').value },
            { l: 'Masseter (D)', v: document.getElementById('regMasseterDir').value },
            { l: 'Masseter (E)', v: document.getElementById('regMasseterEsq').value },
            { l: 'Mento', v: document.getElementById('regMento').value },
            { l: 'Outras', v: document.getElementById('regOutras').value }
        ];

        doc.setFont('helvetica', 'normal');
        let rY = tableY + 10;
        let rX = margin + 5;
        
        regioes.forEach((reg, i) => {
            if (i > 0 && i % 2 === 0) { // 2 colunas
                rY += 6;
                rX = margin + 5;
            } else if (i % 2 !== 0) {
                rX = margin + 5 + (contentWidth / 2);
            }
            
            doc.text(`${reg.l}: ${reg.v || '0'} UI`, rX, rY);
        });

        y += appHeight + 5;

        // 5. OBSERVAÇÕES
        const obsHeight = 30;
        drawSectionBox('Observações', obsHeight, y);
        const observacoes = document.getElementById('observacoes').value || 'Sem observações.';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const splitObs = doc.splitTextToSize(observacoes, contentWidth - 10);
        doc.text(splitObs, margin + 5, y + 12);

        // --- PÁGINA 2: TERMO DE CONSENTIMENTO ---
        doc.addPage();

        // Cabeçalho Pág 2
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('TERMO DE CONSENTIMENTO', margin, 18);

        y = 45;

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const termoTexto = document.querySelector('.consent-box').innerText;
        // Remove quebras de linha excessivas do innerText
        const cleanTermo = termoTexto.replace(/\n\s*\n/g, '\n\n');
        
        const splitTermo = doc.splitTextToSize(cleanTermo, contentWidth);
        doc.text(splitTermo, margin, y);

        // Assinaturas (Rodapé Pág 2)
        y = pageHeight - 50;

        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 80, y);
        doc.setFontSize(9);
        doc.text('Assinatura do Paciente', margin, y + 5);
        
        doc.line(pageWidth - margin - 80, y, pageWidth - margin, y);
        doc.text('Assinatura do Profissional', pageWidth - margin - 80, y + 5);

        // Rodapé final
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        doc.save('registro-toxina-botulinica.pdf');
    });
});

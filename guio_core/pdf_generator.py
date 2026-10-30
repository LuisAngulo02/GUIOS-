"""
Generador de Informes Oficiales en PDF para GUIOS+ (HU-08 / RF-13).
Basado en la Tesis Doctoral GUIOS (Universidad Rey Juan Carlos).
Genera un informe ejecutivo y técnico con portada, dictamen de adopción A/B/C,
matriz FODA, tablas de factores y anexo de trazabilidad de subfactores.
"""

import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class NumberedCanvas(canvas.Canvas):
    """
    Canvas de doble pasada para calcular el total exacto de páginas (Página X de Y),
    y dibujar encabezados y pies de página institucionales en todas las páginas.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []
        self.evaluacion_id = kwargs.get("evaluacion_id", "")
        self.nombre_software = kwargs.get("nombre_software", "FLOSS")

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()

        # Encabezado para páginas 2 en adelante
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(HexColor("#2F5444"))
            self.drawString(36, 805, "GUIOS+")
            self.setFont("Helvetica", 8)
            self.setFillColor(HexColor("#6B7280"))
            self.drawString(75, 805, "|  Informe Oficial de Evaluación de Adopción FLOSS")
            self.drawRightString(
                559, 805, f"Evaluación #{self.evaluacion_id} · {self.nombre_software}"
            )
            self.setStrokeColor(HexColor("#DDE7E1"))
            self.setLineWidth(0.6)
            self.line(36, 798, 559, 798)

        # Pie de página institucional (en todas las páginas)
        self.setStrokeColor(HexColor("#DDE7E1"))
        self.setLineWidth(0.6)
        self.line(36, 42, 559, 42)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(HexColor("#6B7280"))
        self.drawString(
            36, 30, "Metodología GUIOS · Tesis Doctoral URJC · Confidencial y Oficial"
        )
        self.drawRightString(
            559, 30, f"Página {self._pageNumber} de {page_count}"
        )

        self.restoreState()


def generar_informe_pdf(evaluacion):
    """
    Construye y retorna los bytes del PDF oficial para una instancia de Evaluacion.
    """
    buffer = io.BytesIO()

    # Configuración de márgenes: 1.3 cm laterales, 1.8 cm superior/inferior
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=48,
    )

    # Estilos tipográficos
    styles = getSampleStyleSheet()

    color_primary = HexColor("#2F5444")
    color_secondary = HexColor("#3F6F58")
    color_gray_dark = HexColor("#1F2937")
    color_gray_muted = HexColor("#4B5563")

    style_title = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=color_primary,
    )

    style_subtitle = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=color_gray_muted,
    )

    style_h2 = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=color_secondary,
        spaceAfter=6,
        spaceBefore=10,
    )

    style_h3 = ParagraphStyle(
        "SectionH3",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=color_primary,
        spaceAfter=4,
    )

    style_body = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=color_gray_dark,
    )

    style_body_bold = ParagraphStyle(
        "BodyBoldCustom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11.5,
        textColor=color_gray_dark,
    )

    style_small = ParagraphStyle(
        "SmallCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=color_gray_muted,
    )

    style_table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1,  # Center
    )

    style_table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=color_gray_dark,
    )

    style_table_cell_center = ParagraphStyle(
        "TableCellCenter",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=color_gray_dark,
        alignment=1,
    )

    story = []

    # --------------------------------------------------------------------------
    # 1. ENCABEZADO INSTITUCIONAL
    # --------------------------------------------------------------------------
    header_data = [
        [
            Paragraph("<b>GUIOS+</b>", ParagraphStyle("Logo", fontName="Helvetica-Bold", fontSize=22, textColor=color_primary)),
            Paragraph(
                "<b>INFORME OFICIAL DE EVALUACIÓN Y DICTAMEN DE ADOPCIÓN FLOSS</b><br/>"
                "<font size=7.5 color='#6B7280'>Metodología científica GUIOS · Tesis Doctoral URJC · Decisión multicriterio</font>",
                ParagraphStyle("HeaderR", fontName="Helvetica", fontSize=10, leading=13, alignment=2)
            ),
        ]
    ]
    t_header = Table(header_data, colWidths=[120, 403])
    t_header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(t_header)

    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=color_secondary, spaceAfter=10, spaceBefore=4))

    # --------------------------------------------------------------------------
    # 2. FICHA TÉCNICA DE LA EVALUACIÓN
    # --------------------------------------------------------------------------
    evaluador_str = evaluacion.id_usuario.nombre if evaluacion.id_usuario else "Evaluador Principal"
    evaluador_email = evaluacion.id_usuario.email if evaluacion.id_usuario else ""
    fecha_emision = evaluacion.fecha_fin.strftime("%d/%m/%Y %H:%M") if evaluacion.fecha_fin else datetime.now().strftime("%d/%m/%Y %H:%M")
    fecha_inicio_str = evaluacion.fecha_inicio.strftime("%d/%m/%Y %H:%M") if evaluacion.fecha_inicio else "—"

    info_data = [
        [
            Paragraph("<b>Software FLOSS:</b>", style_small),
            Paragraph(f"<b>{evaluacion.nombre_software}</b>", style_body),
            Paragraph("<b>Código / ID:</b>", style_small),
            Paragraph(f"#{evaluacion.id}", style_body),
        ],
        [
            Paragraph("<b>Evaluador Responsable:</b>", style_small),
            Paragraph(f"{evaluador_str} ({evaluador_email})", style_body),
            Paragraph("<b>Fecha Emisión:</b>", style_small),
            Paragraph(fecha_emision, style_body),
        ],
        [
            Paragraph("<b>Metodología Aplicada:</b>", style_small),
            Paragraph("Tesis Doctoral GUIOS (Cap. 5 y 6)", style_body),
            Paragraph("<b>Fecha Inicio:</b>", style_small),
            Paragraph(fecha_inicio_str, style_body),
        ],
        [
            Paragraph("<b>Estado de Persistencia:</b>", style_small),
            Paragraph(f"<font color='#25633C'><b>{evaluacion.get_estado_display()} en PostgreSQL</b></font>", style_body),
            Paragraph("<b>Nivel de Confianza:</b>", style_small),
            Paragraph(f"<b>{evaluacion.nivel_confianza or 'Alto'}</b>", style_body),
        ],
    ]

    t_info = Table(info_data, colWidths=[100, 210, 85, 128])
    t_info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F9FCFA")),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#DDE7E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, HexColor("#EEF4F0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 10))

    # --------------------------------------------------------------------------
    # 3. DICTAMEN OFICIAL DE ADOPCIÓN (RECOMENDACIÓN A, B o C)
    # --------------------------------------------------------------------------
    rec = evaluacion.id_recomendacion
    rec_tipo = rec.tipo if rec else "C"
    rec_titulo = rec.titulo if rec else "Requiere recursos antes de adoptar"

    # Color según recomendación A, B o C
    if rec_tipo == "A":
        bg_card = HexColor("#EBF4EE")
        border_card = HexColor("#25633C")
        badge_color = HexColor("#25633C")
        texto_letra = "RECOMENDACIÓN A"
    elif rec_tipo == "B":
        bg_card = HexColor("#FEF3C7")
        border_card = HexColor("#D97706")
        badge_color = HexColor("#B45309")
        texto_letra = "RECOMENDACIÓN B"
    else:
        bg_card = HexColor("#FEE2E2")
        border_card = HexColor("#DC2626")
        badge_color = HexColor("#DC2626")
        texto_letra = "RECOMENDACIÓN C"

    dictamen_texto = evaluacion.dictamen_texto or (
        rec.texto_orientador if rec else "Evaluación completada con base en los criterios de la tesis doctoral GUIOS."
    )
    viabilidad_val = float(evaluacion.indice_viabilidad or 100.0)

    dictamen_table_data = [
        [
            Paragraph(
                f"<font size=18 color='{badge_color}'><b>{rec_tipo}</b></font><br/>"
                f"<font size=8 color='{badge_color}'><b>{texto_letra}</b></font>",
                ParagraphStyle("RecBadge", alignment=1, leading=15)
            ),
            Paragraph(
                f"<font size=12 color='{color_primary}'><b>{rec_titulo}</b></font><br/>"
                f"<font size=8.5 color='#374151'>{dictamen_texto}</font><br/><br/>"
                f"<font size=8 color='#6B7280'><b>Índice de Viabilidad FLOSS:</b> {viabilidad_val:.1f}% &nbsp;&nbsp;|&nbsp;&nbsp; "
                f"<b>Nivel de Confianza:</b> {evaluacion.nivel_confianza or 'Alto'} &nbsp;&nbsp;|&nbsp;&nbsp; "
                f"<b>Umbral Decisorio:</b> Ponderación Media mínima de 3.00 / 4.00</font>",
                ParagraphStyle("RecDesc", leading=12)
            ),
        ]
    ]

    t_dictamen = Table(dictamen_table_data, colWidths=[90, 433])
    t_dictamen.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg_card),
        ("BOX", (0, 0), (-1, -1), 1.5, border_card),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_dictamen)
    story.append(Spacer(1, 10))

    # --------------------------------------------------------------------------
    # 4. MATRIZ FODA DE ADOPCIÓN (CUADRANTES 2x2)
    # --------------------------------------------------------------------------
    story.append(Paragraph("<b>Diagnóstico FODA de la Adopción FLOSS</b>", style_h2))
    story.append(Paragraph(
        "Clasificación automática de factores relevantes según la <b>Ecuación 5.3</b> de la tesis: "
        "los factores con ponderación media <b>PM &ge; 3.00</b> se catalogan como positivos (Fortalezas u Oportunidades), "
        "mientras que <b>PM &lt; 3.00</b> corresponden a Debilidades o Amenazas. "
        "Los factores con importancia <b>Importante</b> o <b>Fundamental</b> y nota deficiente son marcados como <b>Críticos</b>.",
        style_subtitle
    ))
    story.append(Spacer(1, 5))

    foda_qs = evaluacion.resultados_foda.select_related("id_factor").order_by("id")
    fortalezas = []
    oportunidades = []
    debilidades = []
    amenazas = []

    for item in foda_qs:
        f_nombre = item.id_factor.nombre
        pm_str = f"{item.ponderacion_media:.2f}"
        if item.critico:
            item_text = f"• <b>{f_nombre}</b> (PM: {pm_str}) <font color='#DC2626'><b>[CRÍTICO]</b></font>"
        else:
            item_text = f"• {f_nombre} (PM: {pm_str})"

        if item.categoria == "fortaleza":
            fortalezas.append(item_text)
        elif item.categoria == "oportunidad":
            oportunidades.append(item_text)
        elif item.categoria == "debilidad":
            debilidades.append(item_text)
        elif item.categoria == "amenaza":
            amenazas.append(item_text)

    txt_fortalezas = "<br/>".join(fortalezas) if fortalezas else "<i>Sin fortalezas identificadas</i>"
    txt_oportunidades = "<br/>".join(oportunidades) if oportunidades else "<i>Sin oportunidades identificadas</i>"
    txt_debilidades = "<br/>".join(debilidades) if debilidades else "<i>Sin debilidades (Cumplimiento total)</i>"
    txt_amenazas = "<br/>".join(amenazas) if amenazas else "<i>Sin amenazas (Ecosistema seguro)</i>"

    foda_matrix_data = [
        [
            Paragraph(f"<b>FORTALEZAS ({len(fortalezas)})</b><br/><font size=7 color='#15803D'>Factores Internos · PM &ge; 3.00</font>", ParagraphStyle("FodaH1", fontName="Helvetica-Bold", fontSize=9, textColor=HexColor("#166534"))),
            Paragraph(f"<b>OPORTUNIDADES ({len(oportunidades)})</b><br/><font size=7 color='#1D4ED8'>Factores Externos · PM &ge; 3.00</font>", ParagraphStyle("FodaH2", fontName="Helvetica-Bold", fontSize=9, textColor=HexColor("#1E40AF"))),
        ],
        [
            Paragraph(txt_fortalezas, style_body),
            Paragraph(txt_oportunidades, style_body),
        ],
        [
            Paragraph(f"<b>DEBILIDADES ({len(debilidades)})</b><br/><font size=7 color='#B45309'>Factores Internos · PM &lt; 3.00</font>", ParagraphStyle("FodaH3", fontName="Helvetica-Bold", fontSize=9, textColor=HexColor("#92400E"))),
            Paragraph(f"<b>AMENAZAS ({len(amenazas)})</b><br/><font size=7 color='#DC2626'>Factores Externos · PM &lt; 3.00</font>", ParagraphStyle("FodaH4", fontName="Helvetica-Bold", fontSize=9, textColor=HexColor("#991B1B"))),
        ],
        [
            Paragraph(txt_debilidades, style_body),
            Paragraph(txt_amenazas, style_body),
        ],
    ]

    t_foda = Table(foda_matrix_data, colWidths=[261, 262])
    t_foda.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), HexColor("#DCFCE7")),
        ("BACKGROUND", (1, 0), (1, 0), HexColor("#DBEAFE")),
        ("BACKGROUND", (0, 2), (0, 2), HexColor("#FEF3C7")),
        ("BACKGROUND", (1, 2), (1, 2), HexColor("#FEE2E2")),
        ("BOX", (0, 0), (-1, -1), 1, HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_foda)
    story.append(Spacer(1, 10))

    # --------------------------------------------------------------------------
    # 5. TABLA DE RESULTADOS POR FACTOR (DETALLE METODOLÓGICO)
    # --------------------------------------------------------------------------
    story.append(Paragraph("<b>Síntesis Metodológica y Ponderación de Factores</b>", style_h2))

    tabla_factores_header = [
        Paragraph("<b>Factor GUIOS</b>", style_table_header),
        Paragraph("<b>Dimensión</b>", style_table_header),
        Paragraph("<b>Alcance</b>", style_table_header),
        Paragraph("<b>ID</b>", style_table_header),
        Paragraph("<b>IR</b>", style_table_header),
        Paragraph("<b>PM (/4)</b>", style_table_header),
        Paragraph("<b>FODA</b>", style_table_header),
        Paragraph("<b>Crítico</b>", style_table_header),
    ]

    factores_rows = [tabla_factores_header]

    # Mapeo de FODA y notas
    foda_dict = {f.id_factor_id: f for f in foda_qs}

    rf_qs = evaluacion.resultados_factor.select_related(
        "id_factor", "id_factor__id_dimension"
    ).order_by("id_factor__id_dimension", "id_factor_id")

    for rf in rf_qs:
        f_obj = rf.id_factor
        foda_entry = foda_dict.get(f_obj.id)
        pm_val = f"{foda_entry.ponderacion_media:.2f}" if foda_entry else "—"
        cat_foda = foda_entry.get_categoria_display() if foda_entry else "Irrelevante"
        es_critico = "SÍ" if (foda_entry and foda_entry.critico) else "No"

        # Color distintivo en celda
        critico_styled = f"<font color='#DC2626'><b>{es_critico}</b></font>" if es_critico == "SÍ" else es_critico

        factores_rows.append([
            Paragraph(f"<b>{rf.nombre_factor}</b>", style_table_cell),
            Paragraph(f_obj.id_dimension.nombre[:12], style_table_cell),
            Paragraph(rf.alcance_aplicado or f_obj.alcance, style_table_cell_center),
            Paragraph(str(rf.importancia_decisor), style_table_cell_center),
            Paragraph(rf.importancia_relativa[:4], style_table_cell_center),
            Paragraph(pm_val, style_table_cell_center),
            Paragraph(cat_foda, style_table_cell_center),
            Paragraph(critico_styled, style_table_cell_center),
        ])

    t_factores = Table(
        factores_rows,
        colWidths=[140, 75, 55, 30, 48, 50, 75, 50]
    )
    t_factores.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), color_secondary),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#DDE7E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#F9FCFA")]),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_factores)
    story.append(Spacer(1, 10))

    # --------------------------------------------------------------------------
    # 6. ANEXO DE TRAZABILIDAD: SUBFACTORES Y REACTIVOS CALIFICADOS
    # --------------------------------------------------------------------------
    subfactores_qs = evaluacion.resultados_subfactor.select_related(
        "id_subfactor", "id_subfactor__id_factor"
    ).order_by("id_subfactor__codigo")

    if subfactores_qs.exists():
        story.append(PageBreak())
        story.append(Paragraph("<b>Anexo Técnico de Auditoría: Subfactores y Reactivos Calificados</b>", style_h2))
        story.append(Paragraph(
            "Detalle pormenorizado de los 61 reactivos oficiales (SF-01 a SF-61) evaluados con escala 1 a 4: "
            "1 = No cumple el requisito, 2 = Desconozco / No sé, 3 = Cumple parcialmente, 4 = Cumple el requisito plenamente.",
            style_subtitle
        ))
        story.append(Spacer(1, 6))

        sfs_header = [
            Paragraph("<b>Cód.</b>", style_table_header),
            Paragraph("<b>Factor</b>", style_table_header),
            Paragraph("<b>Reactivo Afirmativo</b>", style_table_header),
            Paragraph("<b>Nota</b>", style_table_header),
            Paragraph("<b>Observación / Justificación</b>", style_table_header),
        ]

        sfs_rows = [sfs_header]

        for rs in subfactores_qs:
            sf = rs.id_subfactor
            obs_text = rs.observacion.strip() if rs.observacion else "—"
            sfs_rows.append([
                Paragraph(f"<b>{sf.codigo}</b>", style_table_cell_center),
                Paragraph(sf.id_factor.nombre[:18], style_table_cell),
                Paragraph(sf.descripcion, style_table_cell),
                Paragraph(f"<b>{rs.calificacion}</b> / 4", style_table_cell_center),
                Paragraph(obs_text, style_table_cell),
            ])

        t_sfs = Table(
            sfs_rows,
            colWidths=[42, 90, 215, 46, 130],
            repeatRows=1,
        )
        t_sfs.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), color_primary),
            ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#DDE7E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, HexColor("#E5E7EB")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#F9FCFA")]),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_sfs)

    # --------------------------------------------------------------------------
    # 7. CIERRE Y FIRMA DEL EVALUADOR
    # --------------------------------------------------------------------------
    story.append(Spacer(1, 20))
    firma_data = [
        [
            Paragraph("____________________________________________<br/><b>Firma del Evaluador / Decisor</b><br/>"
                      f"<font color='#6B7280'>{evaluador_str}</font>", ParagraphStyle("Firma1", alignment=1, leading=12)),
            Paragraph("____________________________________________<br/><b>Sello Institucional / Validez</b><br/>"
                      "<font color='#6B7280'>GUIOS+ Adopción FLOSS Verificada</font>", ParagraphStyle("Firma2", alignment=1, leading=12)),
        ]
    ]
    t_firma = Table(firma_data, colWidths=[261, 262])
    t_firma.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(KeepTogether([t_firma]))

    # Construir documento
    canvas_maker = lambda *args, **kwargs: NumberedCanvas(
        *args,
        evaluacion_id=evaluacion.id,
        nombre_software=evaluacion.nombre_software,
        **kwargs
    )

    doc.build(story, canvasmaker=canvas_maker)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes

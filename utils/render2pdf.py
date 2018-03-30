import pdfkit
from django.template.loader import get_template
from django.http import HttpResponse


def render_to_pdf(template_src, data={}):
    template = get_template(template_src)
    html = template.render({'data': data})
    pdf = pdfkit.from_string(html, False)

    file_name = 'fact-nr-' + str(data['invoice']['invoice_no']) + \
                '_' + str(data['invoice']['invoice_date']) + '.pdf'
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="' + \
        file_name + '"'

    return response

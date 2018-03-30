jQuery(document).ready(function($) {
    
    // fetch & render client data
    $("#client_id").off('change').on('change', function(e) {
        e.preventDefault();
        var clientId = $(this).val();
        
        if (clientId == '') {
            $('#client-info').html('');
            $('#invoice_id').Inv('resetField');
            $('#receipt_id').Inv('resetField');
            $('#invoice_no').Inv('resetField');
            $('#invoice_date').Inv('resetField');
            $('#contract_id').Inv('resetField');
            $('#table-invoice tbody.invoice-body').Inv('resetField');
            return;
        }
        
        $('#client-info').Inv('renderData', {
            method: 'POST',
            url: '/ajaxInv/client/',
            data: {
                client_id: clientId,
                action: 'render-client-info',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            fields: {
                '_client_address:': 'client_address',
                'O.R.C.': 'client_orc',
                'C.U.I.': 'client_cui',
                'Banca': 'client_bank',
                'Cont': 'client_account'
            }
        });
        
        // get client invoices
        $('#invoice_id').Inv('populateField', {
            method: 'POST',
            url: '/ajaxInv/invoice/',
            data: {
                client_id: clientId,
                action: 'get-client-invoices',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });

        // get client contracts
        $('#contract_id').Inv('populateField', {
            method: 'POST',
            url: '/ajaxInv/invoice/',
            data: {
                client_id: clientId,
                action: 'get-client-contracts',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
        
        setTimeout(function() {
            $('#invoice_id').trigger('change');
        }, 200);
    });
    
    // fetch & render invoice lines
    $('#invoice_id').off('change').on('change', function(e) {
        e.preventDefault();
        
        if ($(this).val() == "") {
            $('#receipt_id').Inv('resetField');
            $('#receipt').hide();
            $('#invoice_no').Inv('resetField');
            $('#invoice_date').Inv('resetField');
            $('#contract_id').val('');
            $('#table-invoice tbody.invoice-body').Inv('resetField');
            return;
        }
        
        $.fn.Inv('getInvoiceData', {
            method: 'POST',
            url: '/ajaxInv/invoice/',
            data: {
                invoice_id: $(this).val(),
                action: 'get-invoice-lines',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
        
        $('#receipt_id').Inv('populateField', {
            method: 'POST',
            url: '/receipt/ajaxRec/',
            data: {
                invoice_id: $(this).val(),
                action: 'get-receipts',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });     
    });
    
    $('#contract_id').off('change').on('change', function(e) {
        e.preventDefault();
        $('.contract').html($(this).find(":selected").text());
    });
    
    // add / remove invoice line
    $(document).off('click', '.line-action').on('click', '.line-action', function(e) {
        e.preventDefault();
        
        if ($('#client_id').val() == "") {
            var modal = $('#modal').modal();
            modal.find('.modal-title').text('Beneficiar inexistent');
            modal.find('.modal-body').text('Este necesară selecția unui beneficiar');
            modal.find('#btn-cancel').hide();
            modal.find('#btn-ok').attr('data-dismiss', 'modal');
            return false;
        }
        
        $.fn.Inv('invoiceLineAction', $(this));
    });
    
    // calculate total on invoice line
    $(document).off('keyup', '.qty, .price').on('keyup', '.qty, .price', function(e) {
        e.preventDefault();
        
        var qty, price;
        
        if ($(this).hasClass('qty')) {
            qty   = $(this).val();
            price = $(this).closest('div').parent('td').next('td').find('.price').val();
        } else {
            price = $(this).val();
            qty   = $(this).closest('div').parent('td').prev('td').find('.qty').val();
        }
        
        var total = "--error--";
        var totalField = $(this).closest('div').parent('td').parent('tr').find('td:nth-child(6)').find('.total');
        
        if ($.isNumeric(qty) && $.isNumeric(price)) {
            total = qty * price;
        }
        
        totalField.val(total);
        
        // calculate grand total
        $.fn.Inv('calculateGrandTotal');
    });
    
    // save line
    $('#save_invoice').off('click').on('click', function(e) {
        e.preventDefault();
        
        // TODO: server-side validation!!!
        if (
            $('#client_id').val() == "" 
            || $('#invoice_no').val() == "" 
            || $('#invoice_date').val() == ""
            || $('#contract_id').val() == ""
        ) {
            $.fn.Inv('showNotification', {success: false, message: 'Please fill in the required empty fields'});
            return;
        }
        
        $.fn.Inv('saveInvoice', {
            method: 'POST',
            url: '/ajaxInv/save-invoice/',
            dataType: 'json',
            data: {
                form: $('#form-invoice').Inv('serializeObject'),
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
        
        $('#last-invoice').Inv('updateLastInvoice', {
            timeout: 200,
            method: 'POST',
            url: '/ajaxInv/update-last-invoice/',
            dataType: 'json',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
    });
    
    // delete invoice
    $('#delete_invoice').off('click').on('click', function(e) {
        e.preventDefault();
        var invoice_id = $('#invoice_id').val();
        
        if (invoice_id != "") {
            var modal = $('#modal').modal();
            modal.find('.modal-title').text('Ștergere factură?');
            modal.find('.modal-body').text('Te rog confirmă ștergerea definitivă');
            modal.find('#btn-cancel').show();
            modal.find('#btn-ok').attr('data-dismiss', '');
            
            $(document).off('click', '#btn-ok').on('click', '#btn-ok', function(e) {
                e.preventDefault();
                
                $.fn.Inv('deleteInvoice', {
                    method: 'POST',
                    url: '/ajaxInv/delete-invoice/',
                    dataType: 'json',
                    data: {
                        invoice_id: invoice_id,
                        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
                    }
                });
                
                modal.modal('hide');
                $('#last-invoice').Inv('updateLastInvoice', {
                    timeout: 200,
                    method: 'POST',
                    url: '/ajaxInv/update-last-invoice/',
                    dataType: 'json',
                    data: {
                        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
                    }
                });
            });
        }
    });
    
    $('#download_invoice').off('click').on('click', function(e) {
        e.preventDefault();
        
        var invoice_id = $('#invoice_id').val();
        var receipt_id = $('#receipt_id').val();
        
        if (invoice_id == "") {
            return false;
        }
        
        if (typeof(receipt_id) != 'undefined' && receipt_id != '') {
            receipt_id = receipt_id + '/'
        } else {
            receipt_id = '';
        }
        
        window.open($(this).attr('href') + invoice_id + '/' + receipt_id, '_blank');
    });
    
    // receipts
    $('#receipt_id').off('change').on('change', function(e) {
        e.preventDefault();
        
        if ($(this).val() == ""  || $('#invoice_id').val() == "") {
            $('#receipt_no').Inv('resetField');
            $('#receipt_date').Inv('resetField');
            $('#receipt_amount').Inv('resetField');
            $('#receipt_amount_str').Inv('resetField');
            $('#delete_receipt').hide();
            return;
        }
        
        $.fn.Inv('getReceiptData', {
            method: 'POST',
            url: '/receipt/ajaxRec/',
            data: {
                receipt_id: $(this).val(),
                invoice_id: $('#invoice_id').val(),
                action: 'get-receipt-data',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
        
        $('#receipt-add').hide();
        $('#receipt').show();
    });
    
    $('#receipt-add').off('click').on('click', function(e) {
        e.preventDefault();
        
        $('#receipt-invoice-no').text($('#invoice_no').val());
        $('#receipt-invoice-date').text($('#invoice_date').val());
        $('#receipt-client').html('<strong>' + $('#client_id option:selected').text() + '</strong></br>')
                            .append($('#client-info').html());
        $('#receipt').show();
    });
    
    $(document).off('keyup', '#receipt_amount').on('keyup', '#receipt_amount', function(e) {
        var text = number2Word($(this).val());
        $('#receipt_amount_str').val(text);
    });
    
    $('#delete_receipt').off('click').on('click', function(e) {
        e.preventDefault();
        
        var receipt_id = $('#receipt_id').val();
        
        if (receipt_id != "") {
            var modal = $('#modal').modal();
            modal.find('.modal-title').text('Ștergere chitanta?');
            modal.find('.modal-body').text('Te rog confirmă ștergerea definitivă');
            modal.find('#btn-cancel').show();
            modal.find('#btn-ok').attr('data-dismiss', '');
            
            $(document).off('click', '#btn-ok').on('click', '#btn-ok', function(e) {
                e.preventDefault();
                
                $.fn.Inv('deleteReceipt', {
                    method: 'POST',
                    url: '/receipt/ajaxRec/delete-receipt/',
                    dataType: 'json',
                    data: {
                        receipt_id: receipt_id,
                        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
                    }
                });
                
                modal.modal('hide');
            });
        }
    });
    
    // search
    $(document).off('keyup', '#search').on('keyup', '#search', function(e) {
        e.preventDefault();
        
        var search = $.trim($('#search').val());
        
        if (search.length < 4) {
            if ($('#search-result').is(':visible')) {
                $('#search-result').fadeOut();
            }
            return false;
        }
        
        $('#search-result').Inv('doSearch', {
            method: 'POST',
            url: '/search/',
            dataType: 'json',
            data: {
                search_str: search,
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            }
        });
    });
    
    $(document).off('click', '.search-contract-details').on('click', '.search-contract-details', function(e) {
        e.preventDefault();
        
        $('#search-result').fadeOut();        
        var client_id = $(this).data('clientid');
        
        $('#client_id').val(client_id);
        $('#client_id').trigger('change');
        $('#search').val('');
    });
    
    // bootstrap datepicker wrapper
    $.each($('.datepicker'), function(i, elem) {
        $(elem).Inv('datepicker', {
            format: 'dd-M-yyyy',
            autoclose: true,
            clearBtn: true,
            todayHighlight: true,
            language: 'ro',
            container: '#datepicker-container-' + i
        });  
    });
});

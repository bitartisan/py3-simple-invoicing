(function( $ ) {
    "use strict";
    
    $.fn.Inv = function(options, params) {
        
        this.getInvoiceData = function(params) {
            var $this = this;
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    // populate invoice
                    $('#invoice_no').val(response.inv['invoice_no']);
                    $('#invoice_date').val(response.inv['invoice_date']);
                    $('#contract_id').val(response.inv['contract_id']);
                    
                    if (Object.keys(response.invline).length) {
                        // populate invoice lines
                        var idx;
                        var tbody = $('#table-invoice tbody.invoice-body');
                        var tr = tbody.find('tr:first-child');
                        tbody.html("");
                        $.each(response.invline, function(i, row) {
                            idx = i + 1;
                            var obj = tr.clone();
                            obj.find('th').text(idx);
                            obj.find('select[name="service_id__0"]').attr('name', 'service_id__' + i).val(row.service_id);
                            obj.find('span.contract').text( $("#contract_id option:selected").text() );
                            obj.find('input.qty').attr('name', 'qty__' + i).val(row.qty);
                            obj.find('input.price').attr('name', 'price__' + i).val(row.price);
                            obj.find('input.total').attr('name', 'total__' + i).val(row.qty * row.price);
                            
                            // button
                            if (i > 0 ) {
                                var newBtn = obj.find('button');
                                newBtn.attr('data-lineaction', 'remove');
                                newBtn.removeClass('btn-success').addClass('btn-danger');
                                newBtn.find('span').removeClass('fa-plus').addClass('fa-minus');
                            }
                            obj.appendTo(tbody);
                        });
                        
                        $this.calculateGrandTotal();
                    }
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.invoiceLineAction = function(btn) {
            var action = btn.data('lineaction');
            
            if ('add' === action) {
                // clone last invoice line and render it as the next one
                // change button and action to "remove"
                var tr = btn.closest('td').parent('tr').closest('tbody.invoice-body').find('tr:last-child');
                var newTr = tr.clone(true);
                var i = parseInt(tr.find('th').text()) + 1;
                newTr.find('th').text(i);
                
                var idx = i - 1;
                var newField = newTr.find('input,select');
                $.each(newField, function(key, obj) {
                    var attrName =  $(obj).attr('name');
                    var newAttrName = attrName.replace(/\__[0-9]/g, '') + '__' + idx;
                    $(obj).attr('name', newAttrName);
                });
                
                var newBtn = newTr.find('button');
                newBtn.attr('data-lineaction', 'remove');
                newBtn.removeClass('btn-success').addClass('btn-danger');
                newBtn.find('span').removeClass('fa-plus').addClass('fa-minus');
                
                tr.after('<tr>' + newTr.html() + '</tr>');
            } else if ('remove' === action) {
                // remove row and recalculate grand total
                btn.closest('td').parent('tr').remove();
                this.calculateGrandTotal();
            } else {
                return;
            }
        }
        
        this.saveInvoice = function(params) {
            var $this = this;
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    var notif = response[0];
                    if (notif.action == 'save') {
                        var newInvoiceOption = 'Factura #' + $('#invoice_no').val() + ' / ' 
                                               + $('#invoice_date').val() + ', Ctr ' 
                                               + $('#contract_id option:selected').text();

                        $('<option value="' + notif.invoice_id + '">' + newInvoiceOption + '</option>').insertAfter($('#invoice_id option:first-child'));
                        $('#invoice_id').val(notif.invoice_id);
                    }
                    $('#invoice_id').trigger('change');
                    setTimeout(function() {
                       $('#receipt_id').val(notif.receipt_id);
                       $('#receipt_id').trigger('change');
                    }, 500);
                    $this.showNotification(notif);
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.deleteInvoice = function(params) {
            var $this = this;
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    if (response.success === true) {
                        $('#invoice_id option[value=' + response.invoice_id + ']').remove();
                        $('#invoice_id').val('');
                        $('#invoice_id').trigger('change');
                    }
                    $this.showNotification(response);
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.updateLastInvoice = function(params) {
            var $this = this;
            
            setTimeout(function() {
                $.ajax({
                    method: params.method,
                    url: params.url,
                    data: params.data,
                    success: function(response) {
                        return $this.html(response.last_invoice);
                    },
                    error: function(qXHR, textStatus, errorThrown) {
                        console.log('errorThrown: ' + errorThrown);
                    }
                });
            }, params.timeout);
        }
        
        this.getReceiptData = function(params) {
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    if (Object.keys(response).length) {
                        $('#receipt-invoice-no').text(response.invoice.invoice_no);
                        $('#receipt-invoice-date').text(response.invoice.invoice_date);
                        $('#receipt_no').val(response.receipt.receipt_no);
                        $('#receipt_date').val(response.receipt.receipt_date);
                        $('#receipt_amount').val(response.receipt.receipt_amount);
                        $('#receipt_amount_str').val(response.receipt.receipt_amount_str);
                        $('#receipt-client').html($('#client-info').html());
                        $('#delete_receipt').show();
                    }
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.deleteReceipt = function(params) {
            var $this = this;
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    if (response.success === true) {
                        $('#receipt_id option[value=' + response.receipt_id + ']').remove();
                        $('#receipt_id').val('');
                        $('#receipt_id').trigger('change');
                    }
                    $this.showNotification(response);
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.doSearch = function(params) {
            var $this = this;
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    $this.html('');
                    if (Object.keys(response).length > 0) {
                        var ul = $('<ul>');
                        $.each(response, function(client, row) {
                            var li = $('<li>', {
                                'class': 'search-row',
                            }).append($('<h3>', {
                                 'text': client
                            }));
                            
                            $.each(row, function(i, data) {
                                var p = $('<a>', {
                                    'html': 'Contract <strong>' + data.contract.contract_details
                                            + '</strong> with invoice' 
                                            + (data.invoices.length > 1 ? 's' : '') 
                                            + ':',
                                    'href': 'javascript:;',
                                    'class': 'search-contract-details',
                                    'data-clientid': data.contract.client_id
                                }).append($('<span>', {
                                    'class': 'search-invoices',
                                    'html': data.invoices.join('<br/>')
                                }));
                                
                                p.appendTo(li);
                            });           
                            
                            li.appendTo(ul);
                        });
                        
                        if ($this.is(':hidden')) {
                            $this.fadeIn();
                        }
                        
                        return ul.appendTo($this);
                        
                    } else {
                        $this.fadeOut();
                        $this.html('');
                    }
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.populateField = function(params) {
            var $this = this;

            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    var elemType = $this.get(0).tagName;
                    
                    if ($this.data('toggleempty')) {
                        if (response.length > 0) {
                            $this.show();
                            if ($this.attr('id') == 'receipt_id') {
                                $('#receipt-add').hide();    
                            }
                        } else {
                            $this.hide();
                            if ($this.attr('id') == 'receipt_id') {
                                $('#receipt-add').show();    
                            }
                        }
                    }
                    
                    switch(elemType.toUpperCase()) {
                        case 'SELECT':
                            var topOption = $this.find(":first-child").text();
                            if (topOption == "") {
                                topOption = '---------';
                            }
                            var topOption = '<option value selected>' + topOption + '</option>';
                            
                            if (typeof(response) != 'object' || response.length == 0) {
                                return $this.html(topOption);
                            }
                            
                            var options = [];
                            options.push(topOption);
                            $.each(response, function(i, item) {
                                options.push('<option value="' + item.value + '">' + item.text + '</option>');
                            });
                            
                            return $this.html(options.join("\n"));
                            break;
                    }
                    
                    return $this;
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.resetField = function() {
            var elemType = this.get(0).tagName;
            if (this.data('toggleempty')) {
                this.hide();
            }
            switch(elemType.toUpperCase()) {
                case 'SELECT':
                    return  this.html('<option value selected>' + $(this).find(":first-child").text() + '</option>');
                    break;
                case 'INPUT':
                    return  this.val('');
                    break;
                case 'TBODY':
                    return this.find('tr:gt(0)').remove();
                    break;
            }
        }
        
        this.renderData = function(params) {
            
            var $this = this;
            var data = {};
            
            $.ajax({
                method: params.method,
                url: params.url,
                data: params.data,
                success: function(response) {
                    data = response[0];
                    
                    if (typeof(data) != 'object' || Object.keys(data).length == 0) {
                        return $this.html("");
                    }
                    
                    var dataUl = $('<ul>', {
                        'id': params.data.action,
                        'class': 'data-list'
                    });
                    
                    $.each(params.fields, function(key, val) {
                        if (key.substring(0, 1) == '_') {
                            dataUl.append('<li>' + data[val] + '</li>');
                        } else {
                            dataUl.append(
                                '<li>'
                                    + '<label>' + key + ':</label>'
                                    + '<span>' + data[val] + '<span>'
                                + '</li>'
                            );
                        }
                    });

                    $this.html("");                    
                    return dataUl.appendTo($this);
                },
                error: function(qXHR, textStatus, errorThrown) {
                    console.log('errorThrown: ' + errorThrown);
                }
            });
        }
        
        this.calculateGrandTotal = function() {
            var grandTotal = 0;
            var fieldsArr = [];
            
            $.each($('.total'), function(i, field) {
                fieldsArr.push($(field).val());
            });
            
            var grandTotal = fieldsArr.reduce(function(a, b) { return parseInt(a) + parseInt(b); }, 0);
            if ($.isNumeric(grandTotal)) {
                grandTotal = grandTotal + ' Lei';
            } else {
                grandTotal = ' - ';
            }
            
            $('#grand-total').html(grandTotal);
        }
        
        this.showNotification = function(param) {
            var status = 'Error';
            var type = 'alert-danger';
            var message = param.message;
            if (param.success) {
                status = 'Success';
                type = 'alert-success';
            }
            
            var alert = $('#notification');
            alert.find('strong#notif-status').text(status);
            alert.find('span#notif-message').text(message);
            alert.addClass('show ' + type);
            setTimeout(function() {
                alert.removeClass('show alert-danger alert-success');
            }, 3000);
            
            $('button.close').off('click').on('click', function(e) {
                e.preventDefault();
                $('#notification').removeClass('show alert-danger alert-success');
            });
        }
        
        this.serializeObject = function() {
        	var o = {};
        	var a = this.serializeArray();
        	$.each(a, function() {
        		if (o[this.name]) {
        			if (!o[this.name].push) {
        				o[this.name] = [o[this.name]];
        			}
        			o[this.name].push(this.value || '');
        		} else {
        			o[this.name] = this.value || '';
        		}
        	});
        	return JSON.stringify(o);
        }
        
        if(typeof(this[options]) == 'function') {
            return this[options](params);
        }
        
        // run default actions ...
    }
 
}( jQuery ));

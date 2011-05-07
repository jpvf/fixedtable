(function ($) {

    $.fn.fixedTable = function (method) {

        var defaults = {
            row: 'td', //Se usa th o td en el thead?
            empty : 'empty', //Clase para cuando la clase estÃ© vacia y no desperdicie espacio, ni haga calculos raros.
            sortable: true, //True o False para ordenar con js las columnas.
            sortableFields : 'all', //variable temporal sin asignar todavia.
            height: 500 //Alto de la tabla luego de contar con el vertical scroll
        };

        var settings = {};

        var methods = {

            init: function (options) {
                settings = $.extend({}, defaults, options);
                return this.each(function () {
                    //La tabla, si es que se esta usando una tabla...
                    var element = $(this);
                    
                    //Si no hay tbody o no es una tabla el elemento, se acabÃ³, no hay mucho por hacer.
                    if (helpers._emptyTbody(element) === true || !element.is('table')){
                        return false;
                    }

                    //Ancho total de la tabla, es necesario para recalcular los anchos de las
                    //3 tablas con el espacio que ocupa el scroll bar.
                    var scrollBarWidth = helpers._scrollBarWidth();
                    var tableWidth     = element.width();
                    var ieFix          = ($.browser.msie) ? 0 :0 
                    var newTableWidth  = tableWidth - (scrollBarWidth + ieFix);
                    
                    
                    //Div para envolver la tabla principal, la del body...
                    var wrapper = $('<div class="fixedBody"></div>');                   
                    
                    //Estilos, se reacomoda la tabla con el alto que se especifique o que se tenga por defecto, 
                    //al ancho se le suman 10 pixeles para compensar el scrollBar...
                    wrapper.css({
                        'height': settings.height,
                        'overflow' : 'auto',
                        'width'  : tableWidth 
                    });
                    
                    //...la tabla queda con el ancho original menos 10 pixeles para compensar el scrollBar
                    element.css({
                        'width' : newTableWidth,
                        'table-layout' : 'fixed'
                    });
                    //Se envuelve
                    element.wrap(wrapper);   
                    
                    //Se agrega la clase de la tabla principal por si tiene estilos asociados
                    //o eventos asociados.
                    var tableClass = element.attr('class');
                    
                  //Si existe el tfoot lo duplica, sino no muestra nada, basicamente es lo mismo que
                    //el header.
                    if (element.find('tfoot').length > 0) {                        
                        
                        var fixedFooter = $('<div class="fixedFooter"><table></table></div>');
                        
                        element.parent().after(fixedFooter);

                        fixedFooter.find('table').attr('class', tableClass).css({
                            'width':newTableWidth,
                            'table-layout' : 'fixed'
                         });
                        
         
                    }
                    
                    
                  //Si existe el thead lo duplica sino no muestra nada.
                    if (element.find('thead').length > 0) {
                       
                        
                        //Base del duplicado del header y footer,  vacio pero listo para los datos.
                        //var fixedHeader = $('<style>td{border: 1px solid black !important}</style><div class="fixedHeader"><table></table></div>');
                        var fixedHeader = $('<div class="fixedHeader"><table></table></div>');
                        element.parent().before(fixedHeader);
                                                
                        //Ahora a duplicar los datos internos del thead!!!!
                        element.find('thead tr').find(settings.row).each(function (i) {
                            //Creando cada celda del nuevo thead...
                            var width = helpers._getColWidth($(this));
                            
                            //Agregando estilos a la celda, el ancho de la misma celda en el thead original
                            $(this).css({
                                'width': width + 'px'
                            });
                            
                            //Cuando se reacomode debido a los cambios de ancho y el scrollbar, la tabla
                            //original va a quedar hecha un desastre, entonces se reacomoda con los mismos anchos
                            //que el thead. 
                            element.find('tbody tr:first td').eq(i).css({
                                'width': width + 'px'
                            });
                            
                        });

                         var head = element.find('thead');

                         fixedHeader.find('table').append(head);
                        
                         fixedHeader.find('table').attr('class', tableClass).css({
                            'width':newTableWidth
                         });

                                        element.find('tbody tr:first td').each(function (i) {                           

                            var width = helpers._getColWidth($(this));  
                            
                            element.find('tbody tr:last td').eq(i).css({
                                'width': width + 'px'
                            });        
                            
                        });

                        var dummy = element.find('tbody tr:last');
                        var foot = element.find('tfoot');

                      

                        fixedFooter.find('table').append( '<tbody><tr>' + dummy.html() + '</tr></tbody>').append(foot);
                 
                        element.find("thead").hide();
                        element.find('tfoot').hide();
                    }
                    
                    
                    if (settings.sortable === true){
                        helpers._order(fixedHeader, element);
                    }

                });
            },
            //Proyectada a hacer algo 
            generate: function () {

            }

        };

        var helpers = {

            _emptyTbody: function (element) {
                //Esta vacio el tbody?
                if (element.find('tbody tr.empty').length > 0){
                    return true;
                }
                return false;
            },

            _scrollBarWidth: function(){
                var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>'); 
                $('body').append(div); 
                var w1 = $('div', div).innerWidth(); 
                div.css('overflow-y', 'auto'); 
                var w2 = $('div', div).innerWidth(); 
                $(div).remove(); 
                scrollbarWidth = (w1 - w2);
                return scrollbarWidth;
            },
            
            _getColWidth :  function(td){
                if ($.browser.msie) { return $(td).width() -1 ; }    
                if ($.browser.mozilla) { return $(td).width(); }    
                if ($.browser.safari) { return $(td).outerWidth(); }    
                return $(td).outerWidth();
    
            },

        
            _order : function(header, table) {
                header = header.find('table thead td');
                
                header.each(function(column) {  
                    
                    $(this).addClass('sortable').click(function(){  
                      var findSortKey = function($cell) {  
                        return $cell.find('.sort-key').text().toUpperCase() + ' ' + $cell.text().toUpperCase();  
                      };  
                      var sortDirection = $(this).is('.sorted-asc') ? -1 : 1;  

                      //step back up the tree and get the rows with data  
                      //for sorting  
                      var $rows = table.find('tbody tr').get();  

                      //loop through all the rows and find  
                      $.each($rows, function(index, row) {  
                        num = findSortKey($(row).children('td').eq(column));
                        
                        var parsed = false;
                        
                        if (num.indexOf('$') > 0){
                            num = num.replace('$', '').replace(',', '').replace( /\s/g, "" );
                            num = parseInt(num); 
                            parsed = true;                            
                        }else{
                            num = $.trim(num);
                        }
                        
                        if (!parsed){
                            if (num.match(/^[0-9]$/)){
                                num = parseInt(num);                            
                            }
                        }
                        row.sortKey = num;
                      });  

                      //compare and sort the rows alphabetically  
                      $rows.sort(function(a, b) {  
                          if (a.sortKey < b.sortKey) return -sortDirection;  
                          if (a.sortKey > b.sortKey) return sortDirection;  
                          return 0;  
                      });  

                      //add the rows in the correct order to the bottom of the table  
                      $.each($rows, function(index, row) {  
                          table.find('tbody').append(row);  
                          row.sortKey = null;  
                      });  

                      //identify the column sort order  
                      header.removeClass('sorted-asc sorted-desc');  
                      var $sortHead = header.filter(':nth-child(' + (column + 1) + ')');  
                      
                     // $sortHead.closest('tr').find('.column-sorted').remove();
                      
                      if (sortDirection == 1){
                          $sortHead.addClass('sorted-asc');
                        //  $sortHead.find('#order-icon').html('<span class="ui-icon ui-icon-triangle-1-s column-sorted" style="display:inline"></span>'); 
                      }else{
                          $sortHead.addClass('sorted-desc');
                       //   $sortHead.find('#order-icon').html('<span class="ui-icon ui-icon-triangle-1-n column-sorted" style="display:inline"></span>');
                      } 

                      //identify the column to be sorted by  
                      $('td').removeClass('sorted')  
                                  .filter(':nth-child(' + (column + 1) + ')')  
                                  .addClass('sorted');  

                      $('.visible td').removeClass('odd');  
                   });  
               });  
            },
                        
            filter : function(selector, query) {  
                query =   $.trim(query); //trim white space  
                query = query.replace(/ /gi, '|'); //add OR for regex query  
                
                $(selector).each(function() {  
                  ($(this).text().search(new RegExp(query, "i")) < 0) ? $(this).hide().removeClass('visible') : $(this).show().addClass('visible');  
                });  
              }  
                    

        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' + method + '" does not exist in pluginName plugin!');
        }

    };

})(jQuery);
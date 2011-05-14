(function ($) {

    $.fn.fixedTable = function (method) {

        var defaults = {
            row: 'td',
            empty: 'empty',
            sortable: false,
            height: 500,
            maxWidth: 0
        };

        var settings = {};

        var methods = {

            init: function (options) {
                settings = $.extend({}, defaults, options);
                return this.each(function () {
                    var element = $(this);

                    if (!element.is('table')) {
                        return false;
                    }
                    
                    var scrollBarWidth = helpers._scrollBarWidth();

                    var widthFix = 5;
                    var tableWidth = element.width();
                    var newTableWidth = tableWidth;

                    var fixedTable = $('<div class="fixedTable" style="clear:both"></div>');
       
                    var wrapper = $('<div class="fixedBody"></div>');

                    if (element.find('tbody:first').outerHeight() < settings.height) {
                        settings.height = 'auto';
                        return false;
                    }


                    element.wrap(fixedTable);

                    if (settings.maxWidth) {
                        element.closest('.fixedTable').css({
                            'width': settings.maxWidth,
                            'overflow': 'auto'
                        });
                    }

                    wrapper.css({
                        'height': settings.height,
                        'overflow-y': 'auto',
                        'overflow-x': 'auto',
                        'width': tableWidth + scrollBarWidth + widthFix
                    });

                    element.wrap(wrapper);

                    var tableClass = element.attr('class');

                    var footExists = (element.find('tfoot').length > 0) ? true : false;
                    var headExists = (element.find('thead').length > 0) ? true : false;
                    
                    var cols  = '<colgroup>';
                    
                    element.find('tbody:first tr:first td').each(function (i) {
                        var width = ( helpers._getColWidth($(this)) / newTableWidth * 100 );                        
                        cols += '<col style="width:' + width + '% !important" />';
                    });
                    
                    var tbody = (element.find('tbody:first tr:first'));
                    element.prepend(cols);
                    

                    if (headExists) {
                        var fixedHeader = $('<div class="fixedHeader"><table></table></div>');

                        element.parent().before(fixedHeader);

                        fixedHeader.find('table:first').attr('class', tableClass).css({
                            'width': newTableWidth,
                            'table-layout': 'fixed'
                        });

                        var head = element.find('thead:first');
                        fixedHeader.find('table:first').remove('tbody').append(head);
                        fixedHeader.find('table:first').prepend(cols);
                    }
                    
                    if (footExists) {
                        var fixedFooter = $('<div class="fixedFooter"><table></table></div>');

                        element.parent().after(fixedFooter);

                        fixedFooter.find('table:first').attr('class', tableClass).css({
                            'width': newTableWidth,
                            'table-layout': 'fixed'
                        });

                        var foot = element.find('tfoot:first');
                        fixedFooter.find('table').remove('tbody').append(foot);
                        fixedFooter.find('table:first').prepend(cols);
                    }
                                        
                    element.css({
                        'width': newTableWidth,
                        'table-layout': 'fixed'
                    });
                    
                });
            },

            destroy: function () {
                return this.each(function () {

                    var element = $(this);

                    if (element.parent().is('.fixedHeader')) {
                        element = element.parent().next().find('table');
                    } else if (element.parent().is('.fixedFooter')) {
                        element = element.parent().prev().find('table');
                    }

                    if (!element.parent().is('.fixedBody')) {
                        return false;
                    }

                    element.css('table-layout', 'auto');

                    var fixedHeader = element.parent().prev('.fixedHeader');
                    var fixedFooter = element.parent().next('.fixedFooter');

                    fixedHeader.find('tbody').remove();
                    fixedFooter.find('tbody').remove();

                    var thead = fixedHeader.find('thead');
                    var tfoot = fixedFooter.find('tfoot');

                    element.prepend(thead);
                    element.append(tfoot);

                    fixedFooter.remove();
                    fixedHeader.remove();
                    element.unwrap();
                    element.unwrap();
                });
            }
        };

        var helpers = {

            _scrollBarWidth: function () {
                var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
                $('body').append(div);
                var w1 = $('div', div).innerWidth();
                div.css('overflow-y', 'auto');
                var w2 = $('div', div).innerWidth();
                $(div).remove();
                scrollbarWidth = (w1 - w2);
                return scrollbarWidth;
            },

            _getColWidth: function (td) {
                if ($.browser.msie) {
                    return $(td).width() - 1;
                }
                if ($.browser.mozilla) {
                    return $(td).width();
                }
                if ($.browser.safari) {
                    return $(td).outerWidth();
                }
                return $(td).outerWidth();
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
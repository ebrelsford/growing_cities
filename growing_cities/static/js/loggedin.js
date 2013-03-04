/**************************************************************************** 
 * loggedin.js
 *
 * Functions and initialization that affect any page on the site, but should
 * only be invoked if the user is logged in and can edit the page they are
 * viewing.
 *
 ****************************************************************************/


/*
 * Prepare CKEditor, used for editing that happens within Fiber.
 */
function configureCKEditor() {
    window.CKEDITOR_CONFIG_ZINDEX = 2001;

    window.CKEDITOR_CONFIG_STYLES_SET = [
        { name: 'Submenu', element: 'h3', },
        {
            name: 'Left',
            element: 'img',
            attributes: { style: 'float: left; padding-right: 10px;' }, 
        },
    ];

    window.CKEDITOR_CONFIG_TOOLBAR = window.CKEDITOR_CONFIG_TOOLBAR || [
        ['Format'],
        window.CKEDITOR_CONFIG_STYLES_SET ? ['Styles'] : null,
        ['Bold','Italic'],
        ['NumberedList','BulletedList','Outdent','Indent'],
        ['fPageLink','fFileLink','fImageLink','fCustomLink','fUnlink'],
        ['fImage',],
        ['PasteText','PasteFromWord','RemoveFormat'],
        ['Source'],
    ];
}

configureCKEditor();


/*
 * Fiber initialization.
 */

function initializeFiber() {
    var body_fiber_data = $.parseJSON($('body').dataset('fiber-data'));

    if (!$('body').hasClass('df-admin')) {
        // let Fiber do everything (sidebar + content editing)
        Fiber.adminPage.init(body_fiber_data);
        fiberAdminLoaded = true;
    }
    else {
        // just let Fiber initialize content editing
        Fiber.adminPage.body_fiber_data = body_fiber_data;
        Fiber.adminPage.init_admin_elements();
    }

    if (body_fiber_data.show_login) {
        $('body').addClass('df-admin');
        new LoginFormDialog();
    }
}

$(window).on('statechangecomplete', function(event) {
    initializeFiber();
});

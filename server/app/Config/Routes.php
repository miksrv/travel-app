<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->cli('system/recalculate_tags_count', 'System::calculateTagsCount'); // php index.php system recalculate_tags_count
$routes->cli('system/generate_users_online', 'System::generateUsersOnline'); // php index.php system generate_users_online
$routes->cli('system/send_email', 'System::sendEmail'); // php index.php system send_email

$routes->get('poi', 'Poi::list');
$routes->get('poi/photos', 'Poi::photos');
$routes->get('poi/users', 'Poi::users');
$routes->get('poi/(:alphanum)', 'Poi::show/$1');
$routes->options('poi', 'Poi');
$routes->options('poi/(:alphanum)', 'Poi');

$routes->get('places', 'Places::list');
$routes->get('places/(:alphanum)', 'Places::show/$1');
$routes->post('places', 'Places::create');
$routes->patch('places/cover/(:alphanum)', 'Places::cover/$1');
$routes->patch('places/(:alphanum)', 'Places::update/$1');
$routes->delete('places/(:alphanum)', 'Places::delete/$1');
$routes->options('places', 'Places');
$routes->options('places/(:alphanum)', 'Places');
$routes->options('places/(:alphanum)/(:alphanum)', 'Places');

$routes->get('photos', 'Photos::list');
$routes->post('photos', 'Photos::create');
$routes->post('photos/upload/temporary', 'PhotosTemporary::upload');
$routes->post('photos/upload/(:alphanum)', 'Photos::upload/$1');
$routes->patch('photos/rotate/temporary/(:any)', 'PhotosTemporary::rotate/$1');
$routes->patch('photos/rotate/(:alphanum)', 'Photos::rotate/$1');
$routes->delete('photos/temporary/(:any)', 'PhotosTemporary::delete/$1');
$routes->delete('photos/(:alphanum)', 'Photos::delete/$1');
$routes->options('photos', 'Photos');
$routes->options('photos/(:alphanum)', 'Photos');
$routes->options('photos/(:alphanum)/(:any)', 'Photos');
$routes->options('photos/rotate/temporary/(:any)', 'PhotosTemporary');

$routes->get('notifications/updates', 'Notifications::updates');
$routes->get('notifications/list', 'Notifications::list');
$routes->delete('notifications', 'Notifications::clear');
$routes->options('notifications', 'Notifications');
$routes->options('notifications/(:alphanum)', 'Notifications');

$routes->get('comments', 'Comments::list');
$routes->post('comments', 'Comments::create');
$routes->options('comments', 'Comments');

$routes->get('mail/unsubscribe', 'Mail::unsubscribe');
$routes->options('mail/(:alphanum)', 'Mail');

$routes->get('categories', 'Categories::list');
$routes->options('categories', 'Categories');

$routes->get('rating/history', 'Rating::history');
$routes->get('rating/(:alphanum)', 'Rating::show/$1');
$routes->put('rating', 'Rating::set');
$routes->options('rating', 'Rating');
$routes->options('rating/(:alphanum)', 'Rating');

$routes->get('activity', 'Activity::list');
$routes->get('activity/(:alphanum)', 'Activity::show/$1');
$routes->options('activity', 'Activity');
$routes->options('activity/(:alphanum)', 'Activity');

$routes->get('users', 'Users::list');
$routes->get('users/(:alphanum)', 'Users::show/$1');
$routes->post('users/avatar', 'Users::avatar');
$routes->patch('users/crop', 'Users::crop');
$routes->patch('users/(:alphanum)', 'Users::update/$1');
$routes->options('users', 'Users');
$routes->options('users/(:alphanum)', 'Users');

$routes->get('auth/me', 'Auth::me');
$routes->get('auth/google', 'Auth::google');
$routes->get('auth/yandex', 'Auth::yandex');
$routes->get('auth/vk', 'Auth::vk');
$routes->post('auth/login', 'Auth::login');
$routes->post('auth/registration', 'Auth::registration');
$routes->options('auth/(:alphanum)', 'Auth');

/* Location */
$routes->get('location/search', 'Location::search');
$routes->get('location/geosearch', 'Location::geoSearch');
$routes->get('location/(:num)', 'Location::show/$1');
$routes->put('location', 'Location::coordinates');
$routes->options('location', 'Location');
$routes->options('location/(:any)', 'Location');

/* Levels */
$routes->get('levels', 'Levels::list');
$routes->options('levels', 'Levels');

/* Tags */
$routes->get('tags', 'Tags::list');
$routes->get('tags/search', 'Tags::search');
$routes->options('tags/(:alphanum)', 'Tags');

/* Bookmarks */
$routes->get('bookmarks', 'Bookmarks::check');
$routes->put('bookmarks', 'Bookmarks::set');
$routes->options('bookmarks', 'Bookmarks');
$routes->options('bookmarks/(:alphanum)', 'Bookmarks');

/* Visited Places */
$routes->get('visited/(:alphanum)', 'Visited::place/$1');
$routes->put('visited', 'Visited::set');
$routes->options('visited', 'Visited');
$routes->options('visited/(:alphanum)', 'Visited');

/* Sitemap */
$routes->get('sitemap', 'Sitemap::index');
$routes->options('sitemap', 'Sitemap');

<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('introduce', 'Introduce::hello');
$routes->options('introduce', 'Introduce');

$routes->get('migrate/places', 'Migrate::places');
$routes->cli('migrate/places', 'Migrate::places');
$routes->cli('migrate/users', 'Migrate::users');

$routes->get('poi', 'Poi::list');
$routes->get('poi/photos', 'Poi::photos');
$routes->get('poi/(:alphanum)', 'Poi::show/$1');
$routes->options('poi', 'Poi');
$routes->options('poi/photos', 'Poi');
$routes->options('poi/(:alphanum)', 'Poi');

$routes->get('places', 'Places::list');
$routes->get('places/random', 'Places::random');
$routes->get('places/(:alphanum)', 'Places::show/$1');
$routes->post('places', 'Places::create');
$routes->patch('places/cover/(:alphanum)', 'Places::cover/$1');
$routes->patch('places/(:alphanum)', 'Places::update/$1');
$routes->delete('places/(:alphanum)', 'Places::delete/$1');
$routes->options('places', 'Places');
$routes->options('places/cover/(:alphanum)', 'Places');
$routes->options('places/(:alphanum)', 'Places');

$routes->get('photos', 'Photos::list');
$routes->get('photos/actions', 'Photos::actions');
$routes->post('photos', 'Photos::create');
$routes->post('photos/upload/(:alphanum)', 'Photos::upload/$1');
$routes->delete('photos/(:alphanum)', 'Photos::delete/$1');
$routes->options('photos', 'Photos');
$routes->options('photos/actions', 'Photos');
$routes->options('photos/(:alphanum)', 'Photos');
$routes->options('photos/upload/(:alphanum)', 'Photos');

$routes->get('notifications/updates', 'Notifications::updates');
$routes->get('notifications/list', 'Notifications::list');
$routes->delete('notifications', 'Notifications::clear');
$routes->options('notifications/updates', 'Notifications');
$routes->options('notifications/list', 'Notifications');
$routes->options('notifications', 'Notifications');

$routes->get('countries', 'Countries::list');
$routes->options('countries', 'Countries');

$routes->get('regions', 'Regions::list');
$routes->options('regions', 'Regions');

$routes->get('districts', 'Districts::list');
$routes->options('districts', 'Districts');

$routes->get('cities', 'Cities::list');
$routes->options('cities', 'Cities');

$routes->get('categories', 'Categories::list');
$routes->options('categories', 'Categories');

$routes->get('rating/(:alphanum)', 'Rating::show/$1');
$routes->put('rating', 'Rating::set');
$routes->options('rating/(:alphanum)', 'Rating');
$routes->options('rating', 'Rating');

$routes->get('activity', 'Activity::list');
$routes->get('activity/(:alphanum)', 'Activity::show/$1');
$routes->options('activity', 'Activity');

$routes->get('users', 'Users::list');
$routes->get('users/(:alphanum)', 'Users::show/$1');
$routes->post('users/avatar', 'Users::avatar');
$routes->patch('users/crop', 'Users::crop');
$routes->patch('users/(:alphanum)', 'Users::update/$1');
$routes->options('users', 'Users');
$routes->options('users/(:alphanum)', 'Users');

$routes->get('auth/me', 'Auth::me');
$routes->get('auth/google', 'Auth::google');
$routes->post('auth/login', 'Auth::login');
$routes->post('auth/registration', 'Auth::registration');
$routes->options('auth/(:any)', 'Auth::me');

/* Location */
$routes->get('location/search', 'Location::search');
$routes->get('location/geosearch', 'Location::geoSearch');
$routes->get('location/(:num)', 'Location::show/$1');
$routes->put('location', 'Location::coordinates');
$routes->options('location/search', 'Location');
$routes->options('location/geosearch', 'Location');
$routes->options('location/(:num)', 'Location');
$routes->options('location', 'Location');

/* Tags */
$routes->get('tags', 'Tags::search');
$routes->options('tags', 'Tags');

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
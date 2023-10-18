<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('introduce', 'Introduce::hello');
$routes->options('introduce', 'Introduce');

$routes->get('migration', 'Migrate::init');

$routes->get('poi', 'Poi::list');
$routes->get('poi/photos', 'Poi::photos');
$routes->get('poi/(:alphanum)', 'Poi::show/$1');
$routes->options('poi', 'Poi');

$routes->get('places', 'Places::list');
$routes->get('places/(:alphanum)', 'Places::show/$1');
$routes->post('places', 'Places::create');
$routes->patch('places/(:alphanum)', 'Places::update/$1');
$routes->delete('places/(:alphanum)', 'Places::delete/$1');
$routes->options('places', 'Places');
$routes->options('places/(:alphanum)', 'Places');

$routes->get('photos', 'Photos::list');
$routes->post('photos', 'Photos::create');
$routes->post('photos/upload', 'Photos::upload');
$routes->delete('photos/(:alphanum)', 'Photos::delete/$1');
$routes->options('photos', 'Photos');
//$routes->options('photos/(:alphanum)', 'Photos');
//$routes->options('photos/upload', 'Photos');

$routes->get('countries', 'Countries::list');
$routes->options('countries', 'Countries');

$routes->get('regions', 'Regions::list');
$routes->options('regions', 'Regions');

$routes->get('districts', 'Districts::list');
$routes->options('districts', 'Districts');

$routes->get('cities', 'Cities::list');
$routes->options('cities', 'Cities');

$routes->get('address', 'Address::search');
$routes->options('address', 'Address');

$routes->get('categories', 'Categories::list');
$routes->options('categories', 'Categories');

$routes->get('rating/(:alphanum)', 'Rating::show/$1'); // !!NOT USED!!
$routes->put('rating', 'Rating::set');
$routes->options('rating', 'Rating');

$routes->get('activity', 'Activity::list');
$routes->get('activity/(:alphanum)', 'Activity::show/$1');
$routes->options('activity', 'Activity');

$routes->get('users', 'users::list');
$routes->options('users', 'users');
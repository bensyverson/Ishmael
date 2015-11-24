# HTML Integration

## Overview



## Autowiring

Ideal:

	<div data-ish-model="User" data-ish-id="5">
		<h2>Put username here</h2>
		<p>
			<img src="put photo here" />
			Put description here
			<div data-ish-class="UIButton" 
				 data-ish-target="superview"
				 data-ish-action="close">
				Close
			</div>
		</p>
	</div>
	
> Need some way to set default dataview; maybe as an App subclass?


## `data-ish`
The unique ID for the view

## `data-ish-class`
Should be optional—check

## `data-ish-name`
Optional name to bind to a parent view (first parent with that parameter gets it).

## `data-ish-model`
The name of the data model this view represents

## `data-ish-id`
A model ID, or a CSV array of model IDs

	data-ish-id="5"
	data-ish-id = "5,3,6"
	
## Optimization

Cache the first instance of the View. When you get asked again, up-jump all the uniqueIds, serialize it, de-serialize it, then return it.


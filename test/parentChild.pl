my test /\{
	(
		("_uniqueId":[^,]+,?)
			|
		("_className":[^,]+,?)
			|
		("parent":
			\{
				("_uniqueId":[^,]+,?)
					|
				("_className":[^,]+,?)
					|
				("child":
					\{
						"\$_ish":[^,]+
					\}
				)
			\}
		)
	)+
\}/x

# \{(("_uniqueId":[^,]+,?)|("_className":[^,]+,?)|("parent":\{("_uniqueId":[^,]+,?)|("_className":[^,]+,?)|("child":\{"\$_ish":[^,]+\})\}))+\}/
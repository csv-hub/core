# Exact numbers

When a large number is read from a file or submitted to the database through a Node.JS process, the number may be too big to represent in JavaScript's native number format.

For example, suppose there is a `UInt64` column defined for a table. If the database is storing a *valid value* which happens to be close to the value of 2^64, the native JavaScript representation of that number will be different unless the value is stored as a `BigInt`. 

## Technical Explanation

The JavaScript Number type is a double-precision 64-bit binary format IEEE 754 value, like double in Java or C#. This means it can represent fractional values, but there are some limits to the stored number's magnitude and precision. Very briefly, an IEEE 754 double-precision number uses 64 bits to represent 3 parts:

- 1 bit for the sign (positive or negative)
- 11 bits for the exponent (-1022 to 1023)
- 52 bits for the mantissa (representing a number between 0 and 1)

The mantissa (also called significand) is the part of the number representing the actual value (significant digits). The exponent is the power of 2 that the mantissa should be multiplied by.

The mantissa is stored with 52 bits, interpreted as digits after 1 in a binary fractional number. Therefore, the mantissa's precision is 2-52 (obtainable via Number.EPSILON), or about 15 to 17 decimal places; arithmetic above that level of precision is subject to rounding.

The largest value a number can hold is 21023 × (2 - 2-52) (with the exponent being 1023 and the mantissa being 0.1111... in base 2), which is obtainable via Number.MAX_VALUE. Values higher than that are replaced with the special number constant Infinity.

Integers can only be represented without loss of precision in the range -253 + 1 to 253 - 1, inclusive (obtainable via Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER), because the mantissa can only hold 53 bits (including the leading 1).

![logo](logo.png)

A programming language where you write code that "compiles" into circuits


![code](editor.png) | ![code](settings.png)
-|-

# Documentation

### Types, Constants, Gates, Operators

**Types**
- Hertz: describes a clock. (`500hz`,`5hz`)
- Voltage: describes a voltage given. (`H`,`L`)
- Bit Array: describes a sequence of Highs and Lows that will be stepped trough with each circuit step. (`b01011101`)

**Constants**
- Ground: `_`
- High: `H`
- Low: `L`

**Gates**
There are 3 elementary gates wich can be combined in 7 correct variations.

- AND: `&`
- OR: `|`
- NOT: `!`

Combining them:
- NAND: `!&`
- NOR: `!|`
- XOR: `x|`
- XNOR: `x!|`

**Operators**

- Assignment operators: `<` `>`
- Circuit enclosing operators: `[` `]`
- Boolean operators: `?` `:`

# ToDo
- Save `.cqt` files.
- Save `schamas` into json files (the position of elements on the board).
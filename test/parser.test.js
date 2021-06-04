import { lex } from '../lib/lexer.js'
import { parse } from '../lib/parser.js'

function parsed(input) {
  return [...parse(lex(input))]
}

function expectParsed(input) {
  const result = parsed(input)
  return expect(result.length == 1 ? result[0] : result)
}


describe('parser', () => {
  it('empty file produces nothing', () => {
    expectParsed('').toEqual([])
  })

  it('number is parsed as expression', () => {
    expectParsed('56;').toEqual(['number', '56'])
  })

  it('missing semicolon is an error', () => {
    expect(() => parsed('56')).
      toThrow('Hit end of file - expected \';\'.')
  })

  it('sum of numbers is parsed as expression', () => {
    expectParsed('32 + 44;')
      .toEqual(['operation', '+', ['number', '32'], ['number', '44']])
  })

  it('difference of symbol and number is parsed as expression', () => {
    expectParsed('foo - 44;')
      .toEqual(['operation', '-', ['symbol', 'foo'], ['number', '44']])
  })

  it('multiplication of symbol and symbol is parsed as expression', () => {
    expectParsed('foo * bar;')
      .toEqual(['operation', '*', ['symbol', 'foo'], ['symbol', 'bar']])
  })

  xit('variable assignment gets parsed', () => {
    expectParsed('x = 3;')
      .toEqual(['assignment', ["symbol", "x"], ["number", "3"]])
  })
})

/*
@test
def Function_call_with_no_args_gets_parsed():
    assert_that(
        parsed("print();"),
        equals(
            [
                ("call", ("symbol", "print"), [])
            ]
        )
    )


@test
def Function_call_with_various_args_gets_parsed():
    assert_that(
        parsed("print( 'a', 3, 4 / 12 );"),
        equals(
            [
                (
                    "call",
                    ("symbol", "print"),
                    [
                        ("string", "a"),
                        ("number", "3"),
                        ("operation", "/", ("number", "4"), ("number", "12"))
                    ]
                )
            ]
        )
    )


@test
def Multiple_function_calls_with_no_args_get_parsed():
    assert_that(
        parsed("print()();"),
        equals(
            [
                ("call", ("call", ("symbol", "print"), []), [])
            ]
        )
    )


@test
def Multiple_function_calls_with_various_args_get_parsed():
    assert_that(
        parsed("print( 'a', 3, 4 / 12 )(512)();"),
        equals(
            [
                (
                    "call",
                    (
                        "call",
                        (
                            "call",
                            ("symbol", "print"),
                            [
                                ("string", "a"),
                                ("number", "3"),
                                (
                                    "operation",
                                    "/",
                                    ("number", "4"),
                                    ("number", "12")
                                )
                            ]
                        ),
                        [
                            ("number", "512")
                        ]
                    ),
                    []
                )
            ]
        )
    )


@test
def Assigning_to_a_number_is_an_error():
    try:
        parsed("3 = x;")
        fail("Should throw")
    except Exception as e:
        assert_that(
            str(e),
            equals("You can't assign to anything except a symbol.")
        )


@test
def Assigning_to_an_expression_is_an_error():
    try:
        parsed("x(4) = 5;")
        fail("Should throw")
    except Exception as e:
        assert_that(
            str(e),
            equals("You can't assign to anything except a symbol.")
        )


@test
def Empty_function_definition_gets_parsed():
    assert_that(
        parsed("{};"),
        equals(
            [
                ("function", [], [])
            ]
        )
    )


@test
def Missing_param_definition_with_colon_is_an_error():
    try:
        parsed("{:print(x););")
        fail("Should throw")
    except Exception as e:
        assert_that(
            str(e),
            equals("':' must be followed by '(' in a function.")
        )


@test
def Multiple_commands_parse_into_multiple_expressions():
    program = """
    x = 3;
    func = {:(a) print(a);};
    func(x);
    """
    assert_that(
        parsed(program),
        equals(
            [
                ("assignment", ("symbol", 'x'), ("number", '3')),
                (
                    "assignment",
                    ("symbol", 'func'),
                    (
                        "function",
                        [("symbol", 'a')],
                        [
                            ("call", ("symbol", 'print'), [("symbol", 'a')])
                        ]
                    )
                ),
                ("call", ("symbol", 'func'), [("symbol", 'x')])
            ]
        )
    )


@test
def Empty_function_definition_with_params_gets_parsed():
    assert_that(
        parsed("{:(aa, bb, cc, dd)};"),
        equals(
            [
                (
                    "function",
                    [
                        ("symbol", "aa"),
                        ("symbol", "bb"),
                        ("symbol", "cc"),
                        ("symbol", "dd")
                    ],
                    []
                )
            ]
        )
    )


@test
def Function_params_that_are_not_symbols_is_an_error():
    try:
        parsed("{:(aa + 3, d)};"),
        fail("Should throw")
    except Exception as e:
        assert_that(
            str(e),
            equals(
                "Only symbols are allowed in function parameter lists. "
                + "I found: "
                + "('operation', '+', ('symbol', 'aa'), ('number', '3'))."
            )
        )


@test
def Function_definition_containing_commands_gets_parsed():
    assert_that(
        parsed('{print(3-4); a = "x"; print(a);};'),
        equals(
            [
                (
                    "function",
                    [],
                    [
                        (
                            "call",
                            ("symbol", 'print'),
                            [
                                (
                                    "operation",
                                    '-',
                                    ("number", '3'),
                                    ("number", '4')
                                )
                            ]
                        ),
                        ("assignment", ("symbol", 'a'), ("string", 'x')),
                        ("call", ("symbol", 'print'), [("symbol", 'a')])
                    ]
                )
            ]
        )
    )


@test
def Function_definition_with_params_and_commands_gets_parsed():
    assert_that(
        parsed('{:(x,yy)print(3-4); a = "x"; print(a);};'),
        equals(
            [
                (
                    "function",
                    [
                        ("symbol", "x"),
                        ("symbol", "yy")
                    ],
                    [
                        (
                            "call",
                            ("symbol", 'print'),
                            [
                                (
                                    "operation",
                                    '-',
                                    ("number", '3'),
                                    ("number", '4')
                                )
                            ]
                        ),
                        ("assignment", ("symbol", 'a'), ("string", 'x')),
                        ("call", ("symbol", 'print'), [("symbol", 'a')])
                    ]
                )
            ]
        )
    )


@test
def A_complex_example_program_parses():
    example = """
        double =
            {:(x)
                2 * x;
            };

        num1 = 3;
        num2 = double( num );

        answer =
            if( greater_than( num2, 5 ),
                {"LARGE!"},
                {"small."}
            );

        print( answer );
    """
    parsed(example)


# --- Example programs ---


@system_test
def All_examples_parse():
    from pycell.chars_in_file import chars_in_file
    for example in all_examples():
        with open(example, encoding="ascii") as f:
            parsed(chars_in_file(f))

 */

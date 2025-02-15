"""How many distinct ways can the number x be written as a sum of the integers from a set?

Each integer may be used zero or more times.

"""

from functools import cache
from copy import copy


@cache
def find_paths(target: int,
               choices: tuple[int],
               subpath: tuple[tuple[int, int]] = tuple()):
    subpath = dict(subpath)
    subtotal = 0
    for val, count in subpath.items():
        subtotal += val * count

    for x in sorted(choices):
        if subtotal + x < target:
            new_subpath = copy(subpath)
            new_subpath[x] = new_subpath.get(x, 0) + 1
            yield from find_paths(target, choices,
                                  tuple(sorted(new_subpath.items())))
        elif subtotal + x == target:
            subpath[x] = subpath.get(x, 0) + 1
            yield tuple(sorted(subpath.items()))
            break
        else:
            break


def main():
    """ Entry point. """
    target = 80
    choices = (2, 4, 7, 9, 10, 13, 15, 16, 17, 20, 22)

    paths = set(find_paths(target, choices))
    print(f'There are {len(paths)} way to get to {target}')


if __name__ == '__main__':
    main()

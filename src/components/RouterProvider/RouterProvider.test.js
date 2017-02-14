import React from 'react';
import { renderDeepNoProvider } from '../../util/test-helpers';
import RouterProvider from './RouterProvider';

xdescribe('RouterProvider', () => {
  it('should contain routes from context', () => {
    const router = { name: 'router in context' };
    const Child = (props, context) => {
      return <div>{context.router.name}</div>;
    };
    Child.contextTypes = { router: React.PropTypes.object };

    const tree = renderDeepNoProvider(<RouterProvider router={router}><Child /></RouterProvider>);
    expect(tree.children).toContain('router in context');
  });
});

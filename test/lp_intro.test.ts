import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as LpIntro from '../lib/lp_intro-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new LpIntro.LpIntroStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
